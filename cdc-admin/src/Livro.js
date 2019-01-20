import React, {Component} from 'react';
import pubsub from 'pubsub-js';
import $ from 'jquery';
import InputCustomizado from './componentes/InputCustomizado';
import Button from './componentes/Button';
import TratadorErros from './TratadorErros';

class FormularioLivro extends Component{
    constructor(){
        super();
        this.state = {
            titulo: '',
            preco:'',
            autorId:'',
            msgErro: '',
        }
        this.enviaForm = this.enviaForm.bind(this);
        this.setTitulo = this.setTitulo.bind(this);
        this.setPreco = this.setPreco.bind(this);
        this.setAutorId = this.setAutorId.bind(this);
        this.setMsgErro = this.setMsgErro.bind(this);
    }

    render(){
        return(
            <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm} method="post">
                <InputCustomizado id="titulo" type="text" name="titulo" value={this.state.titulo} onChange={this.setTitulo} label="Titulo"></InputCustomizado>
                <InputCustomizado id="preco" type="text" name="preco" value={this.state.preco} onChange={this.setPreco} label="Preço"></InputCustomizado>
                <div className="pure-control-group">
                    <label htmlFor="autorId">Autor</label>
                    <select value={this.state.autorId} name="autorId" id="autorId" onChange={this.setAutorId}>
                        <option value="">Selecione autor</option>
                        {
                            this.props.autores.map(function(autor){
                                return <option key={autor.id} value={autor.id}>{autor.nome}</option>
                            })
                        }
                    </select>
                    <span className="error">{this.state.msgErro}</span>
                </div>

                <Button type="submit" className="pure-button pure-button-primary" texto="Gravar"></Button>
            </form>
        )
    }

    enviaForm(evento){
        evento.preventDefault();
        console.log('enviando dados');
        $.ajax({
            url: 'http://localhost:8080/api/livros',
            contentType: 'application/json',
            dataType: 'json',
            type: 'post',
            data: JSON.stringify({
                titulo: this.state.titulo,
                preco: this.state.preco,
                autorId: this.state.autorId
            }),
            success: function (resposta) {
                console.log("Sucesso ao enviar dados de cadastro de livro");
                pubsub.publish('atualiza-listagem-livros', resposta);
                this.setState({ titulo: '', preco: '', autorId: '' });
            }.bind(this),
            error: function (resposta) {
                console.log("erro buscar dados da tabela");
                if(resposta.status === 400){
                    new TratadorErros().publicaErros(resposta.responseJSON);
                    let validaAutores = resposta.responseJSON.errors.filter(element => {
                        return element.field === 'autorId'
                    })

                    if(validaAutores[0]){
                        this.setState({ msgErro: validaAutores[0].defaultMessage });
                    }
                    
                }
            }.bind(this),
            beforeSend:function(){
                pubsub.publish("limpa-erros",{});
                this.setState({ msgErro: '', });
            }.bind(this)
        });
    }

    setTitulo(evento){
        this.setState({ titulo: evento.target.value });
    }

    setPreco(evento){
        this.setState({ preco: evento.target.value });
    }

    setAutorId(evento){
        this.setState({ autorId: evento.target.value});
    }

    setMsgErro(evento){
        this.setState({ msgErro: evento.target.value});
    }
}

class TabelaLivros extends Component{
    render(){
        return(
            <table className="pure-table">
                <thead>
                    <tr>
                        <th>Titulo</th>
                        <th>Preço</th>
                        <th>Autor</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        this.props.livros.map(livro => {
                            return (
                                <tr key={livro.id}>
                                    <td>{livro.titulo}</td>
                                    <td>{livro.preco}</td>
                                    <td>{livro.autor.nome}</td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>
        )
    }
}

export default class LivroBox extends Component{
    constructor() {
        super();
        this.state = {
            livros: [],
            autores: []
        };
    }

    componentDidMount(){
        $.ajax({
            url: 'http://localhost:8080/api/livros',
            dataType: 'json',
            success: function (resposta) {
                this.setState({
                    livros: resposta
                });
                console.log("Sucesso ao buscar dados de livros para a tabela");
            }.bind(this),
            error: function (resposta) {
                console.log("erro buscar dados de livros para a tabela");
            }
        });

        $.ajax({
            url: 'http://localhost:8080/api/autores',
            dataType: 'json',
            success: function (resposta) {
                this.setState({
                    autores: resposta
                });
                console.log('sucesso ao buscar listagem de autores');
            }.bind(this),
            error: function (resposta) {
                console.log("Erro ao buscar dados para a listagem de  autores");
            }
        });

        pubsub.subscribe('atualiza-listagem-livros', function(topico, novaListagem){
            this.setState({livros: novaListagem});
        }.bind(this));
    }

    render(){
        return (
            <div>
                <div className="header">
                    <h1>Cadastro de Livros</h1>
                </div>
                <div className="content" id="content">
                    <FormularioLivro autores={this.state.autores}></FormularioLivro>
                    <TabelaLivros livros={this.state.livros}></TabelaLivros>
                </div>
            </div>
        )
    }
}