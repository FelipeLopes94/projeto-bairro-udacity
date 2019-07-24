import React from "react";
import MarcadorWrapper from "./MarcadorWrapper.js";
import { withScriptjs, withGoogleMap, GoogleMap } from "react-google-maps";
import { compose } from "recompose";

/**
Componente onde é renderizado o mapa do Google Maps e seus marcadores
*/
const MapaWrapper = compose(
	withScriptjs,
	withGoogleMap
)(props =>
	<GoogleMap
		clickableIcons={false}
		defaultZoom={15}
		defaultCenter={{ lat: -30.110925, lng: -51.321833 }} //Onde o mapa ira centralizar ao iniciar, Geolocalização setada para a cidade de Guaiba
		onClick={(event) => props.pesquisaFoursquare(event.latLng, props.addLista, props.abrirModal)}
	>

	{props.marcadores.map((marcador, i) => (
		<MarcadorWrapper
			key={i}
			marcador={marcador}
			selecionarMarcador={props.selecionarMarcador}
			marcadorSelecionado={props.marcadorSelecionado}
			deselecionarMarcador={props.deselecionarMarcador}
			abrirModalApp={props.abrirModalApp}
		/>
	))}

	</GoogleMap>
);

export default MapaWrapper;