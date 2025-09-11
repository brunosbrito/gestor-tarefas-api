# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development
- `npm run start:dev` - Start development server with watch mode
- `npm run start:debug` - Start with debugging enabled
- `npm run start:prod` - Start production server
- `npm run build` - Build the application

### Code Quality
- `npm run lint` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier

### Testing
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode  
- `npm run test:cov` - Run tests with coverage
- `npm run test:e2e` - Run end-to-end tests
- `npm run test:debug` - Run tests in debug mode

## Architecture Overview

This is a NestJS-based task management API (`gestor-tarefas-api`) with PostgreSQL database integration using TypeORM. The application follows a modular architecture pattern.

### Core Architecture
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT-based with Passport
- **File Serving**: Static file serving for images via ServeStaticModule
- **External Integrations**: Telegram notifications, HTTP client via Axios

### Module Structure
The application is organized into distinct feature modules:

#### Core Business Modules
- **Activities**: Central entity for task management with status tracking (Planejadas, Em execução, Concluídas, Paralizadas)
- **Projects** (`work`): Project management with service orders
- **Service Orders**: Work order management linked to projects
- **Collaborators**: Team member management with activity assignments
- **Teams**: Team organization and management

#### Supporting Modules  
- **Activity History**: Tracks all activity state changes and modifications
- **Activity Images**: File upload and image management for activities
- **Worked Hours**: Time tracking for collaborators on activities
- **Macro Tasks**: High-level task categorization
- **Processes**: Process definitions for activities
- **Materials**: Resource management
- **Effective**: Personnel effectiveness tracking
- **Value Per Position**: Position-based value calculations
- **Non-Conformity** (`rnc-image`): Quality management and non-conformity tracking

#### Infrastructure Modules
- **Auth**: JWT authentication with user login
- **User**: User management and profiles

### Key Relationships
- Activities belong to Projects and Service Orders
- Activities have many-to-many relationships with Collaborators
- Activities track history through ActivityHistory entity
- Activities can have multiple images and worked hour entries
- Activities are categorized by MacroTasks and Processes

### Database Configuration
- Uses PostgreSQL with environment-based configuration
- TypeORM with `synchronize: false` (production-ready)
- Entity relationships use proper foreign keys and cascade options
- Migrations stored in `src/migrations/`

### External Integrations
- **Telegram Integration**: Automated notifications for activity status changes with specific chat routing based on process IDs
- **File Storage**: Static file serving from `/files/` endpoint
- **CORS**: Enabled for cross-origin requests

### Business Logic Patterns
- Services handle business logic with repository pattern
- DTOs for request/response validation with class-validator
- Activity status workflow management with automatic time calculations
- Sequential numbering (`cod_sequencial`) for activities within project/service order scope