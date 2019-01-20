import PubSub from 'pubsub-js';

export default class TratadorErros {
	publicaErros(erros){
		erros.errors.forEach(element => {
			PubSub.publish('erro-validacao', element)
		});
	}
}