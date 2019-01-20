import React, { Component } from 'react';
import $ from 'jquery';
import InputCustomizado from './componentes/InputCustomizado';
import Button from './componentes/Button';
import pubsub from 'pubsub-js';
import TratadorErros from './TratadorErros';

class FormularioAutor extends Component {
    constructor() {
        super();
        this.state = {
            nome: '',
            email: '',
            senha: ''
        };
        this.enviaForm = this.enviaForm.bind(this);
        this.setNome = this.salvaAlteracao.bind(this, 'nome');
        this.setEmail = this.salvaAlteracao.bind(this, 'email');
        this.setSenha = this.salvaAlteracao.bind(this, 'senha');
    }

    render() {
        return (
            <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm} method="post">
                <InputCustomizado id="nome" type="text" name="nome" value={this.state.nome} onChange={this.salvaAlteracao.bind(this, 'nome')} label="Nome"></InputCustomizado>
                <InputCustomizado id="email" type="email" name="email" value={this.state.email} onChange={this.salvaAlteracao.bind(this, 'email')} label="Email"></InputCustomizado>
                <InputCustomizado id="senha" type="password" name="senha" onChange={this.salvaAlteracao.bind(this, 'senha')} label="Senha"></InputCustomizado>
                <Button type="submit" className="pure-button pure-button-primary" texto="Gravar"></Button>
            </form>
        )
    }

    enviaForm(evento) {
        evento.preventDefault();
        $.ajax({
            url: 'http://localhost:8080/api/autores',
            contentType: 'application/json',
            dataType: 'json',
            type: 'post',
            data: JSON.stringify({
                nome: this.state.nome,
                email: this.state.email,
                senha: this.state.senha
            }),
            success: function (resposta) {
                pubsub.publish('atualiza-listagem-autores', resposta);
                this.setState({ nome: '', email: '', senha: '' });
            }.bind(this),
            error: function (resposta) {
                if (resposta.status === 400) {
                    new TratadorErros().publicaErros(resposta.responseJSON);
                }
            },
            beforeSend: function () {
                pubsub.publish('limpa-erros', {});
            }
        });
    }

    salvaAlteracao(nomeInput,evento){
        var campoSendoAlterado = [];
        campoSendoAlterado[nomeInput] = evento.target.value;
        this.setState(campoSendoAlterado);
    }
}

class TabelaAutores extends Component {
    render() {
        return (
            <table className="pure-table">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>email</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        this.props.lista.map(autor => {
                            return (
                                <tr key={autor.id}>
                                    <td>{autor.nome}</td>
                                    <td>{autor.email}</td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>
        )
    }

}

export default class AutorBox extends Component {
    constructor() {
        super();
        this.state = {
            lista: []
        };
    }

    componentDidMount() {
        $.ajax({
            url: 'http://localhost:8080/api/autores',
            dataType: 'json',
            success: function (resposta) {
                this.setState({
                    lista: resposta
                });

                console.log("enviado com sucesso");
            }.bind(this),
            error: function (resposta) {
                console.log("erro buscar dados da tabela");
            }
        });

        pubsub.subscribe('atualiza-listagem-autores', function (topico, novaListagem) {
            this.setState({ lista: novaListagem });
        }.bind(this));
    }

    render() {
        return (
            <div>
                <div className="header">
                    <h1>Cadastro de autores</h1>
                </div>
                <div className="content" id="content">
                    <FormularioAutor />
                    <TabelaAutores lista={this.state.lista} />
                </div>
            </div>
        )
    }
}
