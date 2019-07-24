import React from "react";

/**
*Componente lida com a renderização da lista de marcadores, na barra lateral
*/
const ListaMarcadores = (
	{marcadores,
	marcadorSelecionado,
	selecionarMarcador,
	isLateralToggled,
	updateQuery,
	query}) => {

		return (
			<aside className={isLateralToggled ? "sidebar-toggle" : "sidebar"}>
				<input
					type="text"
					className="entrada-filtro"
					placeholder="Pesquise os locais aqui."
					value={query}
					onChange={(event) => updateQuery(event.target.value)}
				/>

				{marcadores.map((marcador, i) => (
					<div
						key={i}
						className={"sidebar-inner" + (marcadorSelecionado === marcador ? " selecionado" : "")}
						onClick={() => selecionarMarcador(marcador)}
					>
						<p>{marcador["name"]}</p>
					</div>
				))}
			</aside>
		);
};

export default ListaMarcadores;