{include file="entete.tpl" titre="Démarrer un nouveau travail"}
<div class="container-fluid" style="padding-top: 80px;">
	{if $article}
	<div class="col-xs-12">
		<form method="post" action="?t=nouveau">
			Numéro : <input type="text" name="id_biblio_article" value="{$article->id_biblio_article}"><br/>
			Source : <input type="text" name="source_biblio" value="{$article->iso690()}" style="width:80%"><small><a href="http://fr.wikipedia.org/wiki/ISO_690">norme ISO 690</a><br/>
			<p>la ligne source sera enregistrée comme référence bibliographique sur chaque citation</p>
			<input type="submit" value="Enregistrer">
		</form>
	</div>
	{else}
	<div class="row">
		<div class="col-xs-12">
			<form method="post" action="?t=nouveau">
				Numéro d'article : <input type="text" name="id_biblio_article">
				<input type="submit" value="démarrer"/>
			</form>
			<a href="http://archives.picardie-nature.org/">Trouver un article dans les archives</a>
			<p>(attention a ne pas confondre numéro de document et numéros d'articles)</p>
		</div>
	</div>
	{/if}
</div>
{include file="pied.tpl"}
