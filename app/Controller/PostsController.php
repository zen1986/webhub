<?php

class PostsController extends AppController {
	var $layout = 'blog';
	var $uses = array('User', 'Post', 'Tag', 'Posttag');

	public function beforeFilter() {
		$this->Auth->loginRedirect=array('controller'=>'Post', 'action'=>'index');
		$this->Auth->allow('index', 'view', 'posttag');
	}
	
	public function index() {
		$id = $this->Session->read('Auth.User.id');
		$posts = array();
		if ($id!=null) {
            /*
            $options['joins']=array(
                array(
                    'table'=>'cp_users', 
                    'type'=>'inner',
                    'conditions'=>array(
                        'Post.cp_user_id = cp_users.id'
                    )
                )
            ); 
             */
            $options['order'] = 'Post.created desc';
            $options['conditions'] = array('Post.cp_user_id'=>$id);

            $posts= $this->Post->find('all', $options);
		} else {
			$posts= $this->Post->find('all', array('order'=>'Post.created desc'));
		}
		$this->set('posts', $posts);
	}

	public function create() {
		if ($this->request->is('post')) {
			$this->request->data['Post']['cp_user_id'] = $this->Session->read('Auth.User.id');
			
			
			if ($this->Post->save($this->request->data)) {
				$this->saveTag();
				
				$this->Session->setFlash("Post Saved");
				$this->redirect(array('action'=>'view', $this->Post->id ));
			}
		}
	}	
	public function view($id) {
		$post = $this->Post->find('first', array('conditions'=>array('Post.id'=>$id)));
		$this->set('post_ret', $post);
	}
	public function edit($id=null) {
		$this->Post->id = $id;
		if ($this->request->is('get')) {
			// get
			$this->request->data = $this->Post->read();
			$tags = array();
			foreach ($this->request->data['Posttag'] as $posttag) {
				$tag_id = $posttag['cp_tag_id'];
				$tagname = $this->Tag->read('tagname', $tag_id);
				array_push($tags, $tagname['Tag']['tagname']);
			}

			$this->request->data['Post']['tags'] = implode(',', $tags);
		} else {
			// post
			if ($this->Post->save($this->request->data)) {
				$this->saveTag();
				$this->Session->setFlash('Your post has been updated');
				$this->redirect(array('action'=>'view', $id));
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
	public function posttag($tag_id) {
		if ($tag_id==null || !is_numeric($tag_id)) {
			$this->Session->setFlash('Invalid tag name');
			$this->redirect($this->referer());
		} else {
			$post_ids = $this->Posttag->find('all', array('conditions'=>array('cp_tag_id'=>$tag_id)));
			$posts=array();
			foreach ($post_ids as $post_id) {
				$post_id = $post_id['Posttag']['post_id'];
				$post = $this->Post->find('first', array('conditions'=>array('Post.id'=>$post_id)));
				array_push($posts, $post);
			}
			$this->set('posts', $posts);
		}
	}

	private function saveTag() {
		$p_tags = $this->request->data['Post']['tags'];
		if ($p_tags!=null) {
			$_tags = explode(',', $p_tags);
			foreach ($_tags as $tag) {
				$tag = trim($tag);
				$tags = $this->Tag->find('list', array('fields'=>array('id', 'tagname')));
				if (in_array($tag, $tags)) {
					$tag_id= array_search($tag, $tags);
				} else {
					// if no such tag, create one
					$t = array('Tag'=>array('tagname'=>$tag));
					$this->Tag->create($t);
					$this->Tag->save();
					$tag_id=$this->Tag->id;
				}
				if ($this->Posttag->find('first', array('conditions'=>array('cp_tag_id'=>$tag_id, 'cp_post_id'=>$this->Post->id)))) continue;
				$post_tag = array('Posttag'=>array('cp_tag_id'=>$tag_id, 'post_id'=>$this->Post->id));
				$this->Posttag->create($post_tag);
				$this->Posttag->save();
			}
		}
	}
}
?>
