{include file="entete.tpl" titre="données"}

<div class="container-fluid" style="padding-top: 60px; height:100%; background-color:rgb(70,70,70);">
<span class="label label-primary">{$citations->count()} citations</span>
<table style="background-color:white;" width="100%">
	<tr>
		<th>Espèce</th>
		<th>Effectif</th>
		<th>Observateur</th>
		<th>Etiquettes</th>
		<th>Liens</th>
	</tr>
{foreach from=$citations item=citation}
	{assign var=observation value=$citation->get_observation()}
	<tr>
		<td>{$citation->get_espece()}</td>
		<td>
			{$citation->nb}
			{if $citation->nb_min}min={$citation->nb_min}{/if}
			{if $citation->nb_max}max={$citation->nb_max}{/if}
			{$citation->sexe}
		</td>
		<td>{$observation->get_observateurs_str()}</td>
		<td>
			{foreach from=$citation->get_tags() item=tag}
				{if $tag.ref neq 'ARCA' && $tag.ref neq 'ARCD' && $tag.ref neq 'ARCP' && $tag.ref neq 'RBIB' && $tag.ref neq 'ATTV'}
					<span class="label label-default">{$tag.lib} {if $tag.v_text || $tag.v_int}({$tag.v_text} {$tag.v_int}){/if}</span>
				{/if}
			{/foreach}
		</td>
		<td>
			<a href="http://qg.obs.picardie-nature.org/?t=citation_edit&id={$citation->id_citation}">QG</a>
			<a href="http://obs.picardie-nature.org/occtax/{$citation->guid}">SINP</a>
		</td>
	</tr>
{/foreach}
</table>
</div>
{include file="pied.tpl"}
