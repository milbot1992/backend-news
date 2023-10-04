# Northcoders News API

This is a RESTful API that provides data on news articles, users, comments, and topics. It allows users to retrieve, create, update, and delete articles and comments. Below, you will find information on how to set up and use this API.

## Hosted Version
Link to hosted API: https://news-api-905c.onrender.com

## Project Summary
This project is a News API that offers access to a variety of endpoints for retrieving and managing news articles, user information, comments, and topics. It allows you to perform actions such as fetching articles, posting comments, and updating article votes. Please refer to endpoints.json to view all available endpoints.

## Getting Started
Follow these steps to set up and run the API locally:

### Cloning the repository
git clone https://github.com/milbot1992/backend-news

### Install dependencies
- npm install

### Seed local database
- npm run setup-dbs
- npm run seed

### Run tests
- npm test

### Setting Up Environment Variables

To run this project locally, you'll need to set up some environment variables. These variables are used for database information. Follow these steps to create the environment variables:

#### Create `.env.test` and `.env.development` files

In the root directory of the project, create two files: one named `.env.test` and one named `.env.development`

#### Define Environment Variables

Add database info to each file
1. Open the `.env.test` file you just created and add the following: PGDATABASE=nc_news_test
2. Open the `.env.development` file and add the following: PGDATABASE=nc_news

### Prerequisites
Node.js (Minimum version: X.X.X)
PostgreSQL (Minimum version: X.X.X)



