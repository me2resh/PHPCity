<?php

namespace Utils\Helpers;

final class StringHelper
{
    public static function slugify($text) { return strtolower($text); }
    public static function truncate($text, $length) { return substr($text, 0, $length); }
    public static function capitalize($text) { return ucfirst($text); }
    public static function isEmail($email) { return filter_var($email, FILTER_VALIDATE_EMAIL); }
}