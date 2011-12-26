<?php
class TagsController extends AppController {
	var $layout = "loggedin";
	var $components = array('Auth');

	public function index() {
		$this->set('tags', $this->Tag->find('all'));
	}

	public function edit() {
	}

	public function delete($id) {
		if ($this->Tag->delete($id)) {
			$this->Session->setFlash('Tag deleted');
			$this->redirect(array('action'=>'index'));
		} else {
			$this->Session->setFlash('Unable to delete Tag');
			$this->redirect(array('action'=>'index'));
		}

	}

	public function create() {

	}
	public function tagName($id) {
		return $this->Tag->read('tagname', $id);
	}
}

?>
