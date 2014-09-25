<?php
$start_time = microtime(true);
$context = 'biblio';

if (file_exists('config.php')) 
	require_once('config.php');
else
	require_once('/etc/baseobs/config.php');

define('LOCALE', 'fr_FR.UTF-8');
if (!defined('SBIBLIO_MONGODB'))
	define('SBIBLIO_MONGODB', 'mongodb://localhost:27017');

require_once(SMARTY_DIR.'Smarty.class.php');
require_once(OBS_DIR.'element.php');
require_once(OBS_DIR.'espece.php');
require_once(OBS_DIR.'smarty.php');
require_once(OBS_DIR.'liste_espace.php');
require_once(OBS_DIR.'extractions.php');
require_once(OBS_DIR.'extractions-conditions.php');

class biblio_article {
	public function __construct($id_biblio_article) {
		$json = file_get_contents(sprintf("http://archives.picardie-nature.org/?action=article_json&article=%d",$id_biblio_article));
		$this->data = json_decode($json,true);
	}

	public function __get($k) {
		switch ($k) {
			case 'id_biblio_article':
			case 'id_biblio_document':
			case 'titre':
			case 'premiere_page':
			case 'derniere_page':
			case 'auteurs':
				return $this->data[$k];
			case 'document_titre':
				return $this->data['document']['titre'];
			case 'document_annee_publi':
				return $this->data['document']['annee_publi'];
		}
	}


	public function iso690() {
		$txt = '';
		foreach ($this->auteurs as $a) {
			$txt .= $a.", ";
		}
		$txt = trim($txt, ", \t\n\r\0");

		$txt .= " ; {$this->document_annee_publi} ; {$this->titre} ; In: {$this->document_titre} (ou nom du classeur)";
		return $txt;
	}

	public function citations($db) {
		$tag_archive_article = bobs_tags::by_ref($db, 'ARCA');
		$extraction = new bobs_extractions($db);
		$extraction->ajouter_condition(new bobs_ext_c_tag_int($tag_archive_article->id_tag, $this->id_biblio_article));

		return $extraction->get_citations();
	}
}

class Biblio extends clicnat_smarty {
	protected $db;

	private static function mongodb() {
		static $mdb;
		if (!isset($mdb)) {
			$mc = new MongoClient(SBIBLIO_MONGODB);
			$mdb = $mc->clicnat_saisie_biblio;
		}
		return $mdb;
	}

	public function __construct($db) {
		setlocale(LC_ALL, LOCALE);
		parent::__construct($db, SMARTY_TEMPLATE_SBIBLIO, SMARTY_COMPILE_SBIBLIO, null, SMARTY_CACHEDIR_SBIBLIO);
	}

	public function template() {
		return isset($_GET['t'])?trim($_GET['t']):'accueil';
	}

	public function before_accueil() {
		if (isset($_POST['clicnat_login']) && isset($_POST['clicnat_pwd'])) {
			$utilisateur = bobs_utilisateur::by_login($this->db, trim($_POST['clicnat_login']));
			if (!$utilisateur) {
				$_SESSION['id_utilisateur'] = false;
				$this->ajoute_alerte('danger', "Nom d'utilisateur ou mot de passe incorrect");
			} else {
				if (!$utilisateur->acces_chiros) {
					$_SESSION['id_utilisateur'] = false;
					$this->ajoute_alerte('danger', "Accès réservé aux membres du réseau Chiros");
				} else {
					if (!$utilisateur->auth_ok(trim($_POST['clicnat_pwd']))) {
						$_SESSION['id_utilisateur'] = false;
						$this->ajoute_alerte('danger', "Nom d'utilisateur ou mot de passe incorrect");
					} else {
						$_SESSION['id_utilisateur'] = $utilisateur->id_utilisateur;
						$this->ajoute_alerte('success', "Connexion réussie");
					}
				}
			}
			$this->redirect('?t=accueil');
		} else {
			if (isset($_GET['fermer'])) {
				$_SESSION['id_utilisateur'] = false;
				$this->ajoute_alerte('info', 'Vous êtes maintenant déconnecté');
				$this->redirect('?t=accueil');
			}
		}
	}

	public function before_nouveau() {
		if (isset($_POST['id_biblio_article']))
			$this->assign('article', new biblio_article($_POST['id_biblio_article']));

		if (isset($_POST['source_biblio'])) {
			$docs = $this->mongodb()->docs;
			$data = array(
				"id_biblio_article" => (int)$_POST['id_biblio_article'],
				"source_biblio" => $_POST['source_biblio'],
				"utilisateurs" => array((int)$_SESSION['id_utilisateur']),
				"date_creation" => new MongoDate(),
				"date_termine" => null
			);
			$docs->insert($data);
		}
	}

	public function before_encours() {
		$encours = $this->mongodb()->docs->find(array("date_termine" => null));
		$this->assign_by_ref("encours", $encours);
	}

	public function before_editer() {
		$job = $this->mongodb()->docs->findOne(array("id_biblio_article" => (int)$_GET['doc']));
		if (!$job)
			throw new Exception('pas de job');
		$this->assign_by_ref("job", $job);
		if ($job) {
			$this->assign("titre", $job['source_biblio']);
			$article = new biblio_article($job['id_biblio_article']);
			$this->assign_by_ref('article', $article);
			$this->assign_by_ref('listes', clicnat_listes_espaces::rechercher($this->db, '[biblio]'));
			$this->assign('gender_list', bobs_citation::get_gender_list());
			$this->assign('age_list', bobs_citation::get_age_list());
		}
	}
	
	public function before_citations_article() {
		$article = new biblio_article($this->db, $_GET['id_biblio_article']);
		$citations = $article->citations($this->db);
		$this->assign_by_ref('article', $article);
		$this->assign_by_ref('citations', $citations);
	}

	public function before_json() {
		$this->header_json();
		try {
			$data = array();
			switch ($_GET['a']) {
				case 'espaces_liste_espaces':
					$liste = new clicnat_listes_espaces($this->db, (int)$_GET['id_liste_espace']);
					$data = array(
						'espaces' => array(),
						'id_liste_espace' => $liste->id_liste_espace,
						'nom' => $liste->nom
					);
					foreach ($liste->get_espaces() as $e) {
						$data['espaces'][] = array(
							'espace_table' => $e->get_table(),
							'id_espace' => $e->id_espace,
							'nom' => $e->nom
						);
					}
					break;
				case 'enregistre_citation':
					$data_observation = array(
						'datedeb' => $_POST['date_deb'],
						'datefin' => $_POST['date_fin'],
						'id_espace' => $_POST['id_espace'],
						'table_espace' => $_POST['table_espace'],
						'id_utilisateur' => $_POST['id_utilisateur']
					);
					$id_obs = bobs_observation::insert($this->db, $data_observation);
					$obs = new bobs_observation($this->db, $id_obs);

					foreach ($_POST['observateurs'] as $observateur) {
						$obs->add_observateur($observateur['id']);
					}

					$id_cit = $obs->add_citation($_POST['id_espece']);
					$cit = new bobs_citation($this->db, $id_cit);

					if (isset($_POST['nb']) && !empty($_POST['nb'])) {
						$cit->set_effectif($_POST['nb']);
					} else {
						if (isset($_POST['nb_min']) && isset($_POST['nb_max'])) {
							$cit->set_effectif($_POST['nb_min'], $_POST['nb_max']);
						}
					}
					
					$cit->set_indice_qualite($_POST['indice_qualite']);

					$cit->set_ref_import(sprintf("biblio%d.%d", $_POST['id_biblio_document'],$_POST['id_biblio_article']));

					if (isset($_POST['age']) && !empty($_POST['age'])) {
						$cit->set_age($_POST['age']);
					}

					if (isset($_POST['genre']) && !empty($_POST['genre'])) {
						$cit->set_sex($_POST['genre']);
					}

					if (isset($_POST['commentaire']) && !empty($_POST['commentaire'])) {
						$cit->ajoute_commentaire('info', $_POST['id_utilisateur'], $_POST['commentaire']);
					}

					foreach ($_POST['comportements'] as $comp) {
						$cit->ajoute_tag($comp['id_tag']);
					}

					$tag_archive_article = bobs_tags::by_ref($this->db, 'ARCA');
					$tag_archive_document = bobs_tags::by_ref($this->db, 'ARCD');
					$tag_archive_page = bobs_tags::by_ref($this->db, 'ARCP');
					$tag_ref_biblio = bobs_tags::by_ref($this->db, 'RBIB');

					$cit->ajoute_tag($tag_archive_article->id_tag, $_POST['id_biblio_article']);
					$cit->ajoute_tag($tag_archive_document->id_tag, $_POST['id_biblio_document']);
					$cit->ajoute_tag($tag_archive_page->id_tag, $_POST['biblio_page']);
					$cit->ajoute_tag($tag_ref_biblio->id_tag, null, $_POST['source_biblio']);

					$obs->send();
					$data = array(
						"etat" => "OK",
						"id_observation" => $obs->id_observation,
						"id_citation" => $cit->id_citation
					);
					break;
				default:
					throw new Exception('pas d\'action connue');

			}
			echo json_encode($data);
		} catch (Exception $e) {
			echo json_encode(array("err" => 1, "msg" => $e->getMessage()));
		}
	}

	public function before_autocomplete_observateur() {
		return $this->__before_autocomplete_observateur();
	}

	public function display() {
		global $start_time;

		session_start();

		if (!isset($_SESSION['id_utilisateur']))
			$_SESSION['id_utilisateur'] = false;

		$this->assign('page', $this->template());
		$before_func = 'before_'.$this->template();
		if (method_exists($this, $before_func)) {
			if ($this->template() != 'accueil') {
				if ($_SESSION['id_utilisateur'] == false) {
					throw new Exception('vous devez être identifié');
				}
			}

			if ($_SESSION['id_utilisateur']) 
				$this->assign('utl', get_utilisateur($this->db, $_SESSION['id_utilisateur']));
			else
				$this->assign('utl', false);

			$this->$before_func();
		} else {
			header("HTTP/1.0 404 Not Found");
			throw new Exception('404 Page introuvable');
		}
		parent::display($this->template().".tpl");
	}
}

require_once(DB_INC_PHP);
get_db($db);
$c = new Biblio($db);
$c->display();
?>
