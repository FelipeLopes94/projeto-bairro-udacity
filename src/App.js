import React, { Component } from "react";
import "./App.css";
import "./react-notifications.css";
import Mapa from "./Mapa.js";
import ListaMarcadores from "./ListaMarcadores.js";
import escapeRegExp from "escape-string-regexp";
import Modal from "react-responsive-modal";
import request from "request";
import {NotificationContainer, NotificationManager} from "react-notifications";

class App extends Component {
	state = {
		marcadores: [],
		isLateralToggled: false,
		marcadorSelecionado: null,
		query: "",
		modalOpen: false
	};

	componentDidMount() {

		NotificationManager.info("Marcadores sendo carregados...");

		let ids = [
			"5235f6bd11d24ec6a49b9004",
			"4dcd9089d164679b8ce9ba59",
			"4fa945fae4b0e11774222aaa",
			"4ede7974f5b921398d63c881",
			"505e1261e4b0c67783be73fa",
			"54064602498ef5279ce53cce"
		];

		let marcadoresIniciais = [];

		ids.map((id) => (
			// início do trecho de pesquisa do Foursquare
			request({
				url: "https://api.foursquare.com/v2/venues/" + id,
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
					// NotificationManager.error(" Oh não Limite de requisições excedido  =(", "Erro");


				} else if (JSON.parse(body)["meta"]["code"] === 429) {
					// trata o erro de caso tenha sido atingido o limite de requisições
					console.error(JSON.parse(body)["meta"]["errorDetail"]);
					NotificationManager.error(" Oh não Limite de requisições excedido  =(", "Erro");
				} else {
					let corpo = JSON.parse(body);
					marcadoresIniciais.push(corpo["response"]["venue"]);
				}
			})
		));


		setTimeout(() => {
			this.setState({
				marcadores: marcadoresIniciais
			});
			NotificationManager.success("Marcadores padrões carregados!", "Sucesso!");
		}, 5000); //tempo setado via SetTime para aparecer a msg de carregado.
	};

	/**
	*  Entrada do usuário na pesquisa
	*/
	updateQuery = (query) => {
		this.setState({ query: query.trim() });
	};

	/**
	* Atualiza o estado de marcadores, removendo o marcador indicado pelo parâmetro
	*/
	removeMarcador = (marcador) => {
		this.setState((state) => ({
			marcadores: state.marcadores.filter((c) => c.id !== marcador.id)
		}));
		NotificationManager.success("O marcador foi deletado!", "Sucesso!");
	};
	
	/**
	*  Atualiza o estado de marcadores, adicionando o marcador indicado pelo parâmetro
	*/
	createMarcador = (marcador) => {
		this.setState(state => ({
			marcadores: state.marcadores.concat( [marcador] )
		}));
		NotificationManager.success("O marcador foi criado!", "Sucesso!");
	};
	
	/**
	*  Alterna o estado da barra lateral entre esconder e mostrar
	*/
	toggleLateral() {
		this.setState({ isLateralToggled: !this.state.isLateralToggled });
	};

	/**
	 Altera o estado de marcador selecionado pelo indicado pelo parâmetro
	*/
	selecionarMarcador = (marcador) => {
		this.setState({ marcadorSelecionado: marcador });
	};

	/**
	Altera o estado de marcador selecionado para nulo
	*/
	deselecionarMarcador = () => {
		this.setState({ marcadorSelecionado: null });
	};

	/**
	 Renderiza o conteúdo da aplicação da classe App
	*/
	render() {
		// início do trecho onde é realizado o filtro de marcadores
		let showingMarcadores;
		
		if (this.state.query) {
			const match = new RegExp(escapeRegExp(this.state.query), "i");
			showingMarcadores = this.state.marcadores.filter((marcador) => match.test(marcador["name"]));
		} else {
			showingMarcadores = this.state.marcadores;
		}
		// final do trecho onde é realizado o filtro de marcadores

		return (
			<div className="app">

				<nav className="nav">
					<span className="botao">
						<a href="/">Mapa turstico da cidade de Guaíba</a>
					</span>
					<span className="botao-direita">
					<button type="button"
						title="Mostrar/Esconder Barra lateral"
						onClick={() => this.toggleLateral()}
					>
						☰
					</button>
				</span>

				</nav>

				<ListaMarcadores
					query={this.state.query}
					updateQuery={this.updateQuery}
					isLateralToggled={this.state.isLateralToggled}
					marcadores={showingMarcadores}
					selecionarMarcador={this.selecionarMarcador}
					marcadorSelecionado={this.state.marcadorSelecionado}
				/>

				<Mapa
					isLateralToggled={this.state.isLateralToggled}
					marcadores={showingMarcadores}
					selecionarMarcador={this.selecionarMarcador}
					deselecionarMarcador={this.deselecionarMarcador}
					marcadorSelecionado={this.state.marcadorSelecionado}
					createMarcador={this.createMarcador}
					abrirModalApp={this.abrirModal}
				/>

				<div>
					<Modal open={this.state.modalOpen} onClose={this.fecharModal} center>
						{this.state.marcadorSelecionado &&
							<div>
								<h2>{this.state.marcadorSelecionado["name"]}</h2>
								<p>
									<strong>Categoria: </strong>
									{this.state.marcadorSelecionado["categories"][0]["name"]}
								</p>
								{this.state.marcadorSelecionado["tips"] && 
								<p>
									<strong>Top comentário: </strong>
									<em>
										{
											this.state.marcadorSelecionado["tips"]["groups"][0]["items"][0]["text"]
										}
									</em> - por {" "}
									<a
										target="_blank"
										rel="noopener noreferrer"
										className="link"
										href={this.state.marcadorSelecionado["tips"]["groups"][0]["items"][0]["canonicalUrl"]}
									>
										{
											this.state.marcadorSelecionado["tips"]["groups"][0]["items"][0]["user"]["firstName"]
										}
									</a>
								</p>
								}
								{this.state.marcadorSelecionado["price"] && 
								<p>
									<strong>Preço: </strong>
									{
										"💵 " + this.state.marcadorSelecionado["price"]["message"]
									}
								</p>
								}
								<p>
									<strong>Avaliação: </strong>
									{
										"⭐ " + this.state.marcadorSelecionado["rating"]
									}
								</p>
								<p>
									<strong>Curtidas: </strong>
									{
										"👍 " + this.state.marcadorSelecionado["likes"]["count"]
									}
								</p>
								<p>
									<strong>Endereço: </strong>
									{	"📍 " + this.state.marcadorSelecionado["location"]["formattedAddress"][0] +  " - " +
										this.state.marcadorSelecionado["location"]["formattedAddress"][1]
									}
								</p>
								<p>
									<strong>
										<a
											target="_blank"
											rel="noopener noreferrer"
											className="link"
											href={this.state.marcadorSelecionado["canonicalUrl"]}
										>
											Veja mais no Foursquare
										</a>
									</strong>
								</p>
								<span className="botao-apagar">
									<button type="button"
										onClick={() => {this.removeMarcador(this.state.marcadorSelecionado); this.fecharModal()}}
									>
										Apagar
									</button>
								</span>
								<img
									className="imagem"
									src={
										this.state.marcadorSelecionado["bestPhoto"]["prefix"] +
										"height500" +
										this.state.marcadorSelecionado["bestPhoto"]["suffix"]
									}
									alt={"Foto de " + this.state.marcadorSelecionado["name"]}
								/>
							</div>
						}
					</Modal>
				</div>

				<NotificationContainer/>
			</div>
		);
	};
};

export default App;
