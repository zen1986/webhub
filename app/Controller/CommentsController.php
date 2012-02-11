<?php
class CommentsController extends AppController {
    function add() {
        $pid = $this->request->data['cp_post_id'];
        $name = $this->request->data['name'];
        $website= $this->request->data['website'];
        $email= $this->request->data['email'];
        $comment= $this->request->data['comment'];
        $this->Comment->save($this->request->data);
        $this->redirect("/posts/view/".$pid);
    }
}
