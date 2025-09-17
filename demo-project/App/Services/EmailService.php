<?php

namespace App\Services;

class EmailService
{
    private $mailer;
    private $templates;

    public function send($to, $subject, $body) { /* send email */ }
    public function sendTemplate($to, $template, $data) { /* send template */ }
    public function validateEmail($email) { return true; }
}