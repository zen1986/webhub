<?php
class UsersController extends AppController {
	var $helpers = array('Form');
	var $components = array('Session', 'Auth');

	public function beforeFilter() {
	}

	public function login() {
		//debug($this->request->is("post"));
		if ($this->request->is('post')) {
			if ($this->Auth->login()) {
				return $this->redirect($this->Auth->redirect());
			} else {
				$this->Session->setFlash(__('Username or password is incorrect'), 'default', array(), 'auth');
			}
		}
	}

}

?>
