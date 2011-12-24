<?php

class PostsController extends AppController {
	var $components=array('Auth', 'Session');
	var $layout = 'loggedin';
	var $helpers = array('Session', 'Form', 'Time');
	var $uses = array('User', 'Post', 'Tag');

	public function beforeFilter() {
		//$this->Auth->loginRedirect(array('controller'=>'Post', 'action'=>'index'));
		$this->Auth->allow(array('index', 'view'));
	}
	public function index() {
		$id = $this->Session->read('Auth.User.id');
		$posts = array();
		if ($id!=null) {
			$user= $this->User->find('first', array('conditions'=>array('id'=>$id)));
			$posts = $user['Post'];
		} else {
			$ret= $this->Post->find('all', array('order'=>'Post.created desc'));
			foreach ($ret as $post) {
				array_push($posts, $post['Post']);
			}
		}
		$this->set('posts', $posts);
	}

	public function create() {
		$this->set('tags', $this->Tag->find('all'));
		if ($this->request->is('post')) {
			$this->request->data['Post']['user_id'] = $this->Session->read('Auth.User.id');
			if ($this->Post->save($this->request->data)) {
				$this->Session->setFlash("Post Saved");
				$this->redirect(array('action'=>'view', $this->Post->id ));
			}
		}
	}
	public function view($id) {
		$post = $this->Post->find('first', array('conditions'=>array('Post.id'=>$id)));
	}
	public function edit($id=null) {
		$this->Post->id = $id;
		if ($this->request->is('get')) {
			$this->request->data = $this->Post->read();
		} else {
			if ($this->Post->save($this->request->data)) {
				$this->Session->setFlash('Your post has been updated');
				$this->redirect(array('action'=>'index'));
			} else {
				$this->Session->setFlash('Unable to update your post');
			}
		}
	}

	public function delete($id) {
		if ($this->Post->delete($id)) {
			$this->Session->setFlash('Your post has been deleted');
			$this->redirect(array('action'=>'index'));
		} else {
			$this->Session->setFlash('Unable to delete your post');
			$this->redirect($this->referer());
		}
	}

}
?>
