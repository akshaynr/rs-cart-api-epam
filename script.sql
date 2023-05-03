

create type CART_STATUS_ENUM as enum('OPEN', 'ORDERED');

create table cart (
	id uuid not null default uuid_generate_v4() primary key,
	user_id uuid not null,
	created_at timestamp without time zone default now() not null,
	updated_at timestamp without time zone default now() not null,
	status CART_STATUS_ENUM not null default 'OPEN'
)

create extension if not exists "uuid-ossp"

create table cart_item (
	cart_id uuid not null references cart(id),
	product_id uuid not null,
	count integer not null
)

create table orders (
	id uuid not null default uuid_generate_v4() primary key,
	user_id uuid not null,
	cart_id uuid not null references cart(id),
	payment json,
	delivery json,
	comments text,
	status CART_STATUS_ENUM not null,
	total integer not null
)

create table users(
	id uuid not null default uuid_generate_v4() primary key,
	name text not null,
	email text not null unique,
	password text not null

)

alter table orders drop column user_id

alter table orders add column user_id uuid not null references users(id)


alter table cart drop column user_id



alter table cart add column user_id uuid not null references users(id)


create table products(
id uuid not null default uuid_generate_v4() primary key,
title text not null,
description text not null,
price numeric(3,2)
)

alter table cart_item drop column product_id

alter table cart_item add column product_id uuid not null references products(id)

insert into products(title, description, price) values ('Macbook Pro', 'Short Product Description7', 8.5)


insert into users(name, email, password) values ('Epam', 'akshay_raskar@epam.com', 'VEVTVF9QQVNTV09SRA==');