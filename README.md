# HAP Platform

[![Gitpod Ready-to-Code](https://img.shields.io/badge/Gitpod-Ready--to--Code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/ever-co/gauzy)
[![Join the community on Spectrum](https://withspectrum.github.io/badge/badge.svg)](https://spectrum.chat/gauzy)
[![Gitter](https://badges.gitter.im/JoinChat.svg)](https://gitter.im/ever-co/gauzy?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Get help on Codementor](https://cdn.codementor.io/badges/get_help_github.svg)](https://www.codementor.io/evereq?utm_source=github&utm_medium=button&utm_term=evereq&utm_campaign=github)

HAP™ Platform - **Business Management Platform** focused on **Fairness** and **Transparency**.

You are welcome to check more information about the platform at our official website - **<https://hap.conexoesinfinito.com>**.

![overview](https://gauzy.co/wp-content/themes/gauzy/assets/img/home/home-1.png)

HAP Platform main features:

-   Human Resources Management (HRM), Time Management and Employees Performance Monitoring
-   Customer Relationship Management (CRM)
-   Enterprise Resource Planning (ERP)
-   Project Management
-   Sales Management
-   Financial and Cost Management (including _Accounting_, _Invoicing_, etc)
-   Inventory, Supply Chain Management and Production Management

More detailed list of the features available in the HAP Platform:

-   Dashboard (provides overview of different metrics, such as company income / expenses, employees bonuses, etc.)
-   Time Management / Time Tracking / Activity Tracking / Timesheets
-   Employees Management (register of company employees / contractors, rates of employees, etc.)
-   Employees Onboarding / Candidates Interviews
-   Contacts Management (Clients / Customers / Leads / etc.)
-   Schedules / Appointments / Events
-   Project Management / Tasks
-   Goals / KPI / Objectives / Key Results
-   Sales Pipelines
-   Proposals
-   Accounting / Invoicing / Estimates
-   Billing
-   Payments
-   Income / Expenses Management
-   Time Off Management / Holidays / Approvals
-   Inventory
-   Equipment / Sharing
-   Organization Departments and Teams
-   Organization Clients and Vendors
-   Help Center / Knowledge Base
-   Multiple Organizations Management
-   Tags / Labels
-   Reports
-   Organization and Employee Public Pages
-   Integrations (Upwork, HubStaff, etc.)
-   Email History / Email Templates
-   Data Import / Export
-   Roles / Permissions
-   Multi-currency
-   Multi-language
-   Dark / Light / Corporate and other Themes

Read more [About HAP](https://github.com/ever-co/gauzy/wiki/About-Gauzy) and [How to use it](https://github.com/ever-co/gauzy/wiki/How-to-use-Gauzy) at your company, freelance business, agency, studio or in-house teams.

## Demos, Testing and Production

<!--
-   Gauzy Platform Demo at <https://demo.gauzy.co> (login `admin@ever.co` and password: `admin`)
-   Gauzy Platform Dev builds (using CI/CD, from the `develop` branch) at <https://app.gauzy.dev> (temporary deployed manually)
-   Gauzy Platform SaaS at <https://app.gauzy.co> (not used yet in production, it's same as demo.gauzy.co for now)
-->

### Desktop App

-   Download HAP Desktop App for your OS from <https://github.com/ever-co/gauzy/releases/tag/v0.1.0>.
-   Setup HAP Desktop App with default choices in Setup Wizard and run it
-   HAP Desktop App is ready to use.
-   You can login with `admin@ever.co` and password `admin` to check Admin functionality. Note: such Admin user is not an employee, so you will not be able to track time.
-   You can login with `ruslan@ever.co` and password `admin` to check Desktop Timer and other functionality from "Employee" perspective (such user is an Employee).
-   You can read more information about Desktop App in our [Wiki](https://github.com/ever-co/gauzy/wiki/Gauzy-Desktop-App)

## Technology Stack and Requirements

-   [TypeScript](https://www.typescriptlang.org) language
-   [NodeJs](https://nodejs.org) / [NestJs](https://github.com/nestjs/nest)
-   [Nx](https://nx.dev)
-   [Angular](https://angular.io)
-   [RxJS](http://reactivex.io/rxjs)
-   [TypeORM](https://github.com/typeorm/typeorm)
-   [Ngx-admin](https://github.com/akveo/ngx-admin)
-   [PostgreSQL](https://www.postgresql.org)
-   For production, we integrate and recommend to use [PM2](https://github.com/Unitech/pm2)

Note: thanks to TypeORM, HAP will support lots of DBs: MySql, MariaDb, PostgreSQL, CockroachDb, sqlite, MS SQL, Oracle, MongoDb and others, with minimal changes.

#### See also README.md and CREDITS.md files in relevant folders for lists of libraries and software included in the Platform, information about licenses and other details.

## Documentation

Please refer to our official [Platform Documentation](https://docs.gauzy.co) and to our [Wiki](https://github.com/ever-co/gauzy/wiki) (WIP).

## Quick Start

### With Docker Compose

-   Clone repo
-   Make sure you have Docker Compose [installed locally](https://docs.docker.com/compose/install)
-   Run `docker-compose up`, if you want to build everything (code and Docker images) locally
-   Run `docker-compose -f docker-compose.demo.yml up`, if you want to run the platform using our prebuild Docker images _(note: images might be outdated)_
-   :coffee: time...
-   Open <http://localhost:8080> in your browser
-   Login with email `admin@ever.co` and password: `admin`
-   Enjoy

Note: together with Gauzy, Docker Compose will run following:

-   Cross-platform client for PostgreSQL DBs [pgweb](https://github.com/sosedoff/pgweb), on <http://localhost:8081>
-   [Franchise](https://github.com/HVF/franchise), lightweight but powerful SQL tool with a notebook interface, on <http://localhost:8082>
-   [OmniDb](https://github.com/OmniDB/OmniDB), on <http://localhost:8083> and using default credentials (admin:admin) configure connection string `postgres://postgres:root@db:5432/postgres?sslmode=disable`.
-   [Adminer](https://www.adminer.org) Database management in a single PHP file, on <http://localhost:8084>

### Manually

-   Install and run latest [PostgreSQL](https://www.postgresql.org) (optionally, other DB can be configured manually).
-   Install [Yarn](https://github.com/yarnpkg/yarn) (if you don't have it) with `npm i -g yarn`
-   Install NPM packages with `yarn install`
-   Optionally, if you want to seed a lot of fake data for demo testing, run `yarn seed:all`
-   Run API with `yarn start:api` (by default runs on <http://localhost:3000/api>)
-   Run Gauzy front-end with `yarn start`
-   Open <http://localhost:4200> in your browser
-   Login with email `admin@ever.co` and password: `admin`
-   Enjoy

Notes:

-   during the first API start, DB will be automatically seed with minimum set of initial data if no users found.
-   you can run seed any moment manually (e.g. if you changed entities schemas) with `yarn seed` command to re-initialize DB (warning: unsafe for production!).
-   it is possible to run generation of extremely large amount of fake data for demo purposes / testing with `yarn seed:all` (warning: takes ~10 min to complete)

### Production

-   Check [Gauzy Pulumi](https://github.com/ever-co/gauzy-pulumi) project, it makes Clouds deployments possible with a single command (`pulumi up`)

Note: it currently supports AWS EKS (Kubernetes) for development and production (recommended) with Application Load Balancers and AWS RDS Serverless PostgreSQL DB deployments. In addition, we implemented deployments to ECS EC2 and Fargate Clusters.

## Contribute

-   Please give us :star: on Github, it **helps**!
-   You are more than welcome to submit feature requests
-   Pull requests are always welcome! Please base pull requests against the _develop_ branch and follow the [contributing guide](.github/CONTRIBUTING.md).

## Security

HAP™ follows good security practices, but 100% security cannot be guaranteed in any software!  
HAP™ is provided AS IS without any warranty. Use at your own risk!  
See more details in the [LICENSE](LICENSE).

In a production setup, all client-side to server-side (backend, APIs) communications should be encrypted using HTTPS/WSS/SSL (REST APIs, GraphQL endpoint, Socket.io WebSockets, etc.).

## License

This software is available under following licenses:

-   [Gauzy™ Platform Community Edition](https://github.com/ever-co/gauzy/blob/master/LICENSE.md#gauzy-platform-community-edition-license)
-   [Gauzy™ Platform Small Business](https://github.com/ever-co/gauzy/blob/master/LICENSE.md#gauzy-platform-small-business-license)
-   [Gauzy™ Platform Enterprise](https://github.com/ever-co/gauzy/blob/master/LICENSE.md#gauzy-platform-enterprise-license)

#### The default HAP™ Platform license, without a valid HAP™ Platform Enterprise or HAP™ Platform Small Business License agreement, is the HAP™ Platform Community Edition License.

#### Please see [LICENSE.md](LICENSE.md) for more information on licenses. You can also [compare our offering](https://ever.co/compare-gauzy/#compare).

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fever-co%2Fgauzy.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fever-co%2Fgauzy?ref=badge_large)

## Trademarks

HAP™ is a trademark of Conexões Infinito.  
All other brand and product names are trademarks, registered trademarks or service marks of their respective holders.

## Copyright

#### Copyright © 2020-present, Conexões Infinito. LDA. All rights reserved.

![visitors](https://visitor-badge.laobi.icu/badge?page_id=ever-co.gauzy-platform)
[![Circle CI](https://circleci.com/gh/ever-co/gauzy.svg?style=svg)](https://circleci.com/gh/ever-co/gauzy)
[![codecov](https://codecov.io/gh/ever-co/gauzy/branch/master/graph/badge.svg)](https://codecov.io/gh/ever-co/gauzy)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/8e0f1c13c3d94f18b1523b896d4500aa)](https://www.codacy.com/manual/Ever/gauzy?utm_source=github.com&utm_medium=referral&utm_content=ever-co/gauzy&utm_campaign=Badge_Grade)
[![DeepScan grade](https://deepscan.io/api/teams/3293/projects/8540/branches/103786/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=3293&pid=8540&bid=103786)
[![Known Vulnerabilities](https://snyk.io/test/github/ever-co/gauzy/badge.svg)](https://snyk.io/test/github/ever-co/gauzy)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/ever-co/gauzy.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/ever-co/gauzy/alerts/)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/ever-co/gauzy.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/ever-co/gauzy/context:javascript)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fever-co%2Fgauzy.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fever-co%2Fgauzy?ref=badge_shield)

## P.S.

-   If you interested to run on-demand (delivery) or digital marketplace business, check open-source [Ever Platform](https://github.com/ever-co/ever)
-   [We are Hiring: remote TypeScript / NestJS / Angular developers](https://github.com/ever-co/jobs#available-positions)
