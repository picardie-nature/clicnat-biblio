function Citation() {
	this.id_espece = undefined;
	this.nb = undefined;
	this.nb_min = undefined;
	this.nb_max = undefined;
	this.observateurs = [];
	this.id_espace = undefined;
	this.table_espace = undefined;
	this.indice_qualite = undefined;
	this.commentaire = undefined;
	this.comportements = [];
	this.date_deb = undefined;
	this.date_fin = undefined;
	this.age = undefined;
	this.genre = undefined;

	this.data = function () {
		return {
			'id_espece': this.id_espece,
			'nb': this.nb,
			'nb_min': this.nb_min,
			'nb_max': this.nb_max,
			'observateurs': this.observateurs,
			'id_espace': this.id_espace,
			'table_espace': this.table_espace,
			'indice_qualite': this.indice_qualite,
			'commentaire': this.commentaire,
			'comportements': this.comportements,
			'date_deb': this.date_deb,
			'date_fin': this.date_fin,
			'age': this.age,
			'genre': this.genre
		};
	}
	this.liste_observateurs_ajoute = function (id,nom) {
		id = parseInt(id);
		for (var i=0;i<this.observateurs.length;i++) {
			if (this.observateurs[i].id == id) {
				return false;
			}
		}
		this.observateurs.push({id:id, nom:nom});
		return true;
	}

	this.liste_observateurs_vide = function () {
		this.observateurs = [];
	}

	this.liste_observateurs_retire = function (id) {
		id = parseInt(id);
		for (var i=0;i<this.observateurs.length;i++) {
			if (this.observateurs[i].id == id) {
				this.observateurs.splice(i,1);
				return true;
			}
		}
		return false;
	}

	this.liste_comportements_retire = function (id) {
		id = parseInt(id);
		for (var i=0;i<this.comportements.length;i++) {
			if (this.comportements[i].id_tag == id) {
				this.comportements.splice(i,1);
				return true;
			}
		}
		return false;
	}
}

function Editeur() {
	var elesrc = $('#article');
	this.id_biblio_article = elesrc.attr('id_biblio_article');
	this.id_biblio_document = elesrc.attr('id_biblio_document');
	this.premiere_page = parseInt(elesrc.attr('premiere_page'));
	this.derniere_page = parseInt(elesrc.attr('derniere_page'));
	this.img = document.createElement('img');
	this.citation = new Citation();

	this.data = function () {
		this.citation.indice_qualite = $('#indice_qualite').val();
		this.citation.age = $('#age').val();
		this.citation.genre = $('#genre').val();
		this.citation.commentaire = $('#commentaire').val();
		this.citation.nb = $('#effectif').val();
		this.citation.nb_min = $('#effectif_min').val();
		this.citation.nb_max = $('#effectif_max').val();
		this.citation.date_deb = $('#datedeb').val();
		this.citation.date_fin = $('#datefin').val();
		var data = this.citation.data();

		data['page'] = $('#page').val();

		var article = $('#article');
		data['id_biblio_document'] = article.attr('id_biblio_document'); 
		data['id_biblio_article'] = article.attr('id_biblio_article');
		data['biblio_page'] = $('#page').val();
		data['source_biblio'] = article.attr('source_biblio');
		data['utilisateur'] = article.attr('utilisateur');
		data['id_utilisateur'] = article.attr('id_utilisateur');
		return data;
	}

	$('.o_loc').hide();
	$('.loc').click(function () {
		var d = $(this).attr('did');
		$('.o_loc').hide();
		$('#'+d).show();
	});

	$('#datedeb').datepicker();
	$('#datefin').datepicker();

	$('#deb_eq_fin').click(function () {
		$('#datefin').val($('#datedeb').val());
	});

	$('#btn_envoi').click(function () {
		var data = this.ed.data();
		$('#envoi_log').html("Envoi observation...");
		$.ajax({
			url: '?t=json&a=enregistre_citation',
			success: function (data,txtSt,xhr) {
				if (data['etat'] == 'OK') {
					$('#envoi_log').html("Observation enregistrée id_observation="+data['id_observation']+" id_citation="+data['id_citation']);
				} else {
					if (data['err'] == 1) {
						$('#envoi_log').html("Observation non enregistrée : "+data['msg']);
					} else {
						$('#envoi_log').html("Erreur inconnue ???");
						console.log(data);
					}
				}
			},
			error: function (data,txtSt,xhr) {
				$('#envoi_log').html("Erreur inconnue ???");
				console.log(data);
			},
			data: data,
			type: 'POST'
		});
	});

	// evant après chargement d'une image
	$(this.img).load(function () {
		var canv = $('#canvas');
		var ratio = canv.width()/this.width;
		canv.height(ratio*this.height);
		var ctx = canvas.getContext("2d");

		//sync taille affichée et taille du canvas
		ctx.canvas.width = canv.width();
		ctx.canvas.height = canv.height();

		ctx.drawImage(this,0,0,canv.width(),canv.height());
	});
	
	$('#observateur_recherche').autocomplete({
		source: '?t=autocomplete_observateur',
		select: function (event,ui) {
			this.ed.citation.liste_observateurs_ajoute(ui.item.value,ui.item.label);
			this.ed.raffraichir_liste_observateurs();
			$(this).val('');
			return false;
		}
	});

	$('#espece_recherche').autocomplete({
		source: '?t=autocomplete_espece&affiche_expert=1',
		select: function (event,ui) {
			$('#espece').html(ui.item.label);
			this.ed.citation.id_espece = ui.item.value;
			$(this).val('');
			return false;
		}
	}).data("ui-autocomplete")._renderItem = function (ul,item) {
		return $("<li>").append("<a>"+item.label+"</a>").appendTo(ul);
	};

	$('#commune_recherche').autocomplete({
		source: '?t=autocomplete_commune',
		select: function (event,ui) {
			this.ed.citation.table_espace = 'espace_commune';
			this.ed.citation.id_espace = ui.item.value;
			$('#localisation_info').html('Commune : '+ui.item.label);
			$(this).val('');
			return false;
		}
	});

	$('#departement_recherche').autocomplete({
		source: '?t=autocomplete_departement',
		select: function (event,ui) {
			this.ed.citation.table_espace = 'espace_departement';
			this.ed.citation.id_espace = ui.item.value;
			$('#localisation_info').html('Département : '+ui.item.label);
			$(this).val('');
			return false;
		}
	});

	$('.b_nidif').click(function () {
		var ed = document.getElementById('page').ed;
		ed.citation.comportements.push({id_tag: $(this).attr('id_tag'), lib: $(this).html()});
		ed.raffraichir_liste_comportements();
	});

	$('#comportement_recherche').autocomplete({
		source: '?t=autocomplete_tag_citation',
		select: function (event,ui) {
			this.ed.citation.comportements.push({id_tag: ui.item.value, lib: ui.item.label});
			$(this).val('');
			this.ed.raffraichir_liste_comportements();
			return false;
		}
	});

	$('.lien_liste_espace').click(function () {
		var id_liste = $(this).attr('id_liste_espace');
		$.ajax({
			url: '?t=json&a=espaces_liste_espaces&id_liste_espace='+id_liste,
			success: function (data,txtst,xhr) {
				var out = $('#espaces_liste_espace');
				var ed = document.getElementById('page').ed;
				for (var i=0;i<data.espaces.length;i++) {
					var a = document.createElement('a');
					a.ed = ed;
					a.href = '#';
					a.innerHTML = data.espaces[i].nom;
					$(a).attr('id_espace', data.espaces[i].id_espace);
					$(a).attr('espace_table', data.espaces[i].espace_table);
					$(a).click(function () {
						this.ed.citation.table_espace = $(this).attr('espace_table');
						this.ed.citation.id_espace = $(this).attr('id_espace');
						var info = $('#localisation_info');
						info.html('Depuis la liste d\'espaces ');
						info.append(this.innerHTML);
						info.append(' <i>'+this.ed.citation.table_espace+'.'+this.ed.citation.id_espace+'</i>');

					});
					out.append(a);
				}
			}
		});
	});

	document.getElementById('page').ed = this;
	document.getElementById('page_moins').ed = this;
	document.getElementById('page_plus').ed = this;
	document.getElementById('espece_recherche').ed = this;
	document.getElementById('observateur_recherche').ed = this;
	document.getElementById('commune_recherche').ed = this;
	document.getElementById('departement_recherche').ed = this;
	document.getElementById('comportement_recherche').ed = this;
	document.getElementById('btn_envoi').ed = this;

	$('#page').change(function () {
		var ed = $(this).attr('ed');
		this.ed.change_page($(this).val());
	});

	$('#page_moins').click(function () {
		var page = parseInt($('#page').val());
		if (page > this.ed.premiere_page)
			this.ed.change_page(page-1);
	});

	$('#page_plus').click(function () {
		var page = parseInt($('#page').val());
		if (page < this.ed.derniere_page)
			this.ed.change_page(page+1);
	});

	this.init = function () {
		$('#page_min').html(this.premiere_page);
		$('#page_max').html(this.derniere_page);
		this.change_page(this.premiere_page);
	}

	this.raffraichir_liste_observateurs = function () {
		var out = $('#observateurs');
		out.html('');
		for (var i=0;i<this.citation.observateurs.length;i++) {
			var o = this.citation.observateurs[i];
			var a = document.createElement('a');
			$(a).click(function () {
				this.ed.citation.liste_observateurs_retire($(this).attr('id_utilisateur'));
				this.ed.raffraichir_liste_observateurs();
			});
			$(a).attr('id_utilisateur', o.id);
			a.innerHTML = o.nom;
			a.href = '#';
			a.ed = this;
			out.append(a);
		}
	}

	this.raffraichir_liste_comportements = function () {
		var out = $('#comportements');
		out.html('');
		for (var i=0;i<this.citation.comportements.length;i++) {
			var tag = this.citation.comportements[i];
			var a = document.createElement('a');
			$(a).click(function () {
				this.ed.citation.liste_comportements_retire($(this).attr('id_tag'));
				this.ed.raffraichir_liste_comportements();
			});
			$(a).attr('id_tag', tag.id_tag);
			a.href = '#';
			a.ed = this;
			a.innerHTML = tag.lib;
			out.append(a);
		}
	}

	/**
	 * @brief change de page
	 */
	this.change_page = function (num_page) {
		num_page = parseInt(num_page);
		if ((num_page >= this.premiere_page) && (num_page <= this.derniere_page)) {
			var src = "http://archives.picardie-nature.org/?action=page&document="+this.id_biblio_document+"&w=800&n="+(num_page-1);
			$('#page').val(num_page);
			this.img.src = src;
		} else {
			alert("pas dans l'intervale de page de l'article");
		}
	}
}

function editeur_init() {
	var e = new Editeur();
	e.init();
}
