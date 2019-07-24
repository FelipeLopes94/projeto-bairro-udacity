import React, { Component } from "react";
import MapaWrapper from "./MapaWrapper.js";
import request from "request";
import Modal from "react-responsive-modal";

class Mapa extends Component {

	state = {
		modalOpen: false,
		possiveisLocais: []
	};

	abrirModal = () => {
		this.setState({ modalOpen: true });
	};

	fecharModal = () => {
		this.setState({ modalOpen: false });
	};

	addLista = (lista) => {
		this.setState({ possiveisLocais: lista });
	};
	
	/**
	 Utiliza a API do Foursquare para pesquisar os locais da área clicada
	*/
	pesquisaFoursquare = (location, addLista, abrirModal) => {
		let lista = [];

		// início do trecho de pesquisa do Foursquare
		request({
			url: "https://api.foursquare.com/v2/venues/explore",
			method: "GET",
			qs: {
				client_id: "Z2NYMNE4SMWGC152X03SZEKXGUP21YTHM5EEDDESSAZ5SCDX",
				client_secret: "KG4E02INZ1O2H4BFPC44H0JKEXNHFN4NCV33WICHSIEZUDD1",
				ll: location.lat() + "," + location.lng(),
				v: "20180323"
			}
		}, function(err, res, body) {
			if (err) {
				console.error(err);
				window.alert("Whops =/ Problema ao carregar a API Foursquare! Favor tentar novamente mais tarde!")

			} else if (JSON.parse(body)["meta"]["code"] === 429) {
				// trata o erro de caso tenha sido atingido o limite de requisições
				console.error(JSON.parse(body)["meta"]["errorDetail"]);
				lista = [
					{
						"id" : "erro",
						"nome": "Erro: não foi possível recuperar",
						"endereco": "Se você estiver vendo isso, provavelmente o limite de requisições foi atingido. Aguarde um dia."
					}
				];
			} else {
				let corpo = JSON.parse(body);
				if (corpo["response"]["groups"][0]["items"]) {
					// primeiro ordena do mais próximo ao mais distante da distância dada pelo usuário
					lista = corpo["response"]["groups"][0]["items"]
						.sort((item_a, item_b) =>
							item_a["venue"]["location"]["distance"] - item_b["venue"]["location"]["distance"])
						.map((item) => (
							{
								"id" : item["venue"]["id"],
								"nome": item["venue"]["name"],
								"endereco": item["venue"]["location"]["address"],
								"categoria": item["venue"]["categories"][0]["name"]
							}
						));
					// fim do trecho de pesquisa do Foursquare

					addLista(lista);
					abrirModal();
				}
			}
		});
	};

	/**
	 Utiliza a API do Foursquare buscar mais informações do local escolhido
	*/
	buscarDetalhes = (marcador, createMarcador) => {
		if (marcador.id !== "erro") {
			// início do trecho de pesquisa do Foursquare
			request({
				url: "https://api.foursquare.com/v2/venues/" + marcador["id"],
				method: "GET",
				qs: {
					client_id: "Z2NYMNE4SMWGC152X03SZEKXGUP21YTHM5EEDDESSAZ5SCDX",
					client_secret: "KG4E02INZ1O2H4BFPC44H0JKEXNHFN4NCV33WICHSIEZUDD1",
					v: "20180323"
				}
			}, function(err, res, body) {
				if (err) {
					console.error(err);
					window.alert("Whops =/ Problema ao carregar a API Foursquare! Favor tentar novamente mais tarde!")

				} else if (JSON.parse(body)["meta"]["code"] === 429) {
					// trata o erro de caso tenha sido atingido o limite de requisições
					console.error(JSON.parse(body)["meta"]["errorDetail"]);
				} else {
					let corpo = JSON.parse(body);
					marcador = corpo["response"]["venue"];
				}
				// fim do trecho de pesquisa do Foursquare

				createMarcador(marcador);
			});
		}
	};

	/**
	Renderiza o conteúdo da aplicação da classe Mapa
	*/
	render() {
		const {
			isLateralToggled,
			marcadores,
			selecionarMarcador,
			deselecionarMarcador,
			createMarcador,
			marcadorSelecionado,
			abrirModalApp
		} = this.props;

		return (
			<main aria-label="mapa" className={isLateralToggled ? "mapa-toggle" : "mapa"}>
				<MapaWrapper
					pesquisaFoursquare={this.pesquisaFoursquare}
					selecionarMarcador={selecionarMarcador}
					deselecionarMarcador={deselecionarMarcador}
					marcadores={marcadores}
					marcadorSelecionado={marcadorSelecionado}
					abrirModal={this.abrirModal}
					abrirModalApp={abrirModalApp}
					addLista={this.addLista}
					googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyAiPa9wW3XCE-ixT6MVshJLOxIlb18WGWk&libraries=geometry,drawing,places"
					loadingElement={<div style={{ height: `100%` }} />}
					containerElement={<div style={{ height: `100%` }} />}
					mapElement={<div style={{ height: `100%` }} />}
				/>

				<div>
					<Modal
						open={this.state.modalOpen}
						onClose={this.fecharModal}
						center
					>
						<h2>Escolha o local que você gostaria de adicionar:</h2>
						{this.state.possiveisLocais.map((local, i) => (
							<div key={i}>
								<div
									className="local-escolher"
									onClick={() => {this.buscarDetalhes(local, createMarcador); this.fecharModal()}}
								>
									<h3>{local["nome"]}</h3>
									<p>
										<strong>Categoria: </strong>
										{local["categoria"]}
									</p>
									<p>
										<strong>Endereço: </strong>
										{local["endereco"]}
									</p>
								</div>
								<hr />
							</div>
						))}
					</Modal>
				</div>
			</main>
		);
	};
};

export default Mapa;