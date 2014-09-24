{include file="entete.tpl" titre="Document(s) en cours"}
<div class="container-fluid" style="padding-top: 80px;">
	<div class="col-xs-12">
		<table>
		<tr>
			<th>Source</th><th></th>
		</tr>
		{foreach from=$encours item=doc}
			<tr>
				<td>{$doc.source_biblio}</td>
				<td><a href="?t=editer&doc={$doc.id_biblio_article}">éditer</a></td>
			</tr>
		{/foreach}
		</table>
	</div>
</div>
{include file="pied.tpl"}
