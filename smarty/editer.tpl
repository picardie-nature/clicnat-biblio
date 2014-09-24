{include file="entete.tpl" titre=$titre}
<script src="editeur.js"></script>
<div class="container-fluid" style="padding-top: 60px; height:100%; background-color:rgb(70,70,70);">
{if $article}
	<div class="col-xs-6"  style="height:100%; overflow:scroll;">
		<div style="background-color:black; color:white; text-align:center;">
			<button class="btn btn-xs btn-primary" id="page_moins"><span class="glyphicon glyphicon-backward"></span></button>
			<span id="page_min"></span>
			<input type="text" id="page" style="background-color:rgb(50,50,50); width:50px; text-align: center;">
			<span id="page_max"></span>
			<button  class="btn btn-xs btn-primary" id="page_plus"><span class="glyphicon glyphicon-forward"></span></button>
		</div>
		<canvas id="canvas" style="width:100%; height:100%;"></canvas>
	</div>
	<div class="col-xs-6" style="height:100%; overflow:scroll; background-color:rgb(200,210,200);">
		<button id="btn_envoi" class="btn btn-primary pull-right">Envoyer <span class="glyphicon glyphicon-ok"></span></button>
		<a href="?t=citations_article&id_biblio_article={$article->id_biblio_article}" target="_blank">Citations</a>
		<div id="envoi_log"></div>
		<fieldset><legend>Espèce</legend>
			Recherche : <input type="text" id="espece_recherche">
			qualité ident. 
			<select id="indice_qualite">
				<option value="1">faible</option>
				<option value="2">moyen</option>
				<option value="3">fort</option>
				<option value="4" selected="1">très fort</option>
			</select>
			<br/>
			<div id="espece"></div>
		</fieldset>
		<fieldset><legend>Comportement - Étiquette</legend>
			Recherche : <input type="text" id="comportement_recherche">
			<div class="dropdown">
				<button class="btn btn-default dropdown-toggle" type="button" id="btn_nidif" data-toggle="dropdown">
					Nidif <span class="caret"></span>
				</button>
				<ul class="dropdown-menu" role="menu" aria-labelledby="btn_nidif">
					<li role="presentation"><a role="menuitem" tabindex="-1" href="#" class="b_nidif" id_tag="120">Nicheur</a></li>
					<li role="presentation"><a role="menuitem" tabindex="-1" href="#" class="b_nidif" id_tag="121">Nicheur probable</a></li>
					<li role="presentation"><a role="menuitem" tabindex="-1" href="#" class="b_nidif" id_tag="122">Nicheur possible</a></li>
					<li role="presentation"><a role="menuitem" tabindex="-1" href="#" class="b_nidif" id_tag="123">Nicheur certain</a></li>
				</ul>
			</div>
			<div id="comportements"></div>
		</fieldset>
		<fieldset><legend>Observateurs</legend>
			<div id="observateurs"></div>
			Recherche : <input type="text" id="observateur_recherche"><br/>
			</fieldset>
			<fieldset><legend>Effectif</legend>
			Précis : <input type="text" id="effectif"><br/>
			ou Min Max : <input type="text" id="effectif_min"> <input type="text" id="effectif_max"><br/>
			Genre :
				<select id="genre">
				{foreach from=$gender_list item=g}
					<option value="{$g.val}">{$g.lib}</option>
				{/foreach}
				</select>
			Age :
				<select id="age">
				{foreach from=$age_list item=a}
					<option value="{$a.val}">{$a.val} {$a.lib}</option>
				{/foreach}
				</select>
		</fieldset>
		<fieldset><legend>Date</legend>
			Date:
			<input placeholder="Date début" type="text" id="datedeb">
			<a class="btn btn-primary btn-sm" href="#" id="deb_eq_fin"><span class="glyphicon glyphicon-circle-arrow-right"></span></a> 
			<input placeholder="Date fin" type="text" id="datefin">
		</fieldset>
		<fieldset><legend>Localisation</legend>
		<a href="#" class="loc" did="d_lespace">Liste d'espace</a>
		<a href="#" class="loc" did="d_commune">Commune</a>
		<a href="#" class="loc" did="d_departement">Département</a>
		<div id="localisation_info"></div>
		<div id="d_lespace" class="o_loc">
			<ul>
			{foreach from=$listes item=l}
				<li><a href="#" class="lien_liste_espace" id_liste_espace="{$l->id_liste_espace}">{$l->nom}</a></li>
			{/foreach}
			</ul>
			<div id="espaces_liste_espace"></div>
		</div>
		<div id="d_commune" class="o_loc">
			Nom de la commune : <input type="text" id="commune_recherche"/>
		</div>
		<div id="d_departement" class="o_loc">
			Nom du département : <input type="text" id="departement_recherche"/>
		</div>
		<!-- <div id="map" style="width:100%; height: 300px;">
		</div> -->
		</fieldset>
		<fieldset><legend>Commentaire</legend>
			<textarea id="commentaire" style="width:100%; height: 200px;"></textarea>
		</fieldset>
	</div>
	<div 
		id="article"
		id_biblio_article="{$article->id_biblio_article}"
		id_biblio_document="{$article->id_biblio_document}"
		premiere_page="{$article->premiere_page}"
		derniere_page="{$article->derniere_page}"
		source_biblio="{$titre}"
		id_utilisateur="{$utl->id_utilisateur}"
		utilisateur="{$utl}"

	></div>
{else}
	Pas de document...
{/if}
</div>
{include file="pied.tpl" js_init="editeur_init"}
