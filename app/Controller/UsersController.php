<?php
class UsersController extends AppController {
	var $layout = 'loggedin';

	public function beforeFilter() {
		$this->Auth->allow(array('logout'));
		$this->Auth->logoutRedirect = array('action'=>'home', 'controller'=>'pages');
	}

	public function login() {
		if ($this->request->is('post')) {
			$data = $this->request->data;
			$username = $data['User']['username'];
			$pass = $data['User']['password'];

			$entry = $this->User->find('first', array('conditions'=>array('User.username'=>$username)));
			$password = $entry['User']['password'];

			if ($password == sha1($pass)) {
				$this->Auth->login($entry['User']);
				$this->redirect('/pages/home');
			} else {
				$this->Session->setFlash(__('Username or password is incorrect'), 'default', array(), 'auth');
			}
		} else {
			$this->Session->write('redirectURL', $this->Session->read('Auth.redirect')); 
		}
	}

	public function main() {
	}

	public function logout() {
		$this->redirect($this->Auth->logout());
	}
}

?>
