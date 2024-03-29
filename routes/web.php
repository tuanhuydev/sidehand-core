<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

use App\Http\Controllers\AuthController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('pages.home');
})->name('home');

Route::get('/auth/{type}', [AuthController::class, 'index'])->name('pages.auth');

Route::get('/upload', function() {
    return view('pages.upload');
})->name('upload');

Route::get('/admin/{path?}', function () {
    return view('pages.admin', ['title' => 'Sidehand - Admin']);
})->where('path', '.*')->name('admin');


