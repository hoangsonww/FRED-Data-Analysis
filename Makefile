# Makefile for FRED Data Analysis Project

# Directories
BACKEND_DIR   := backend
FRONTEND_DIR  := frontend

# Commands
NPM           := npm
TSX           := npx tsx
DC            := docker-compose

.PHONY: help install install-backend install-frontend \
        data-fetch vectorize analysis chat api frontend \
        docker-build up clean

help:
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  install             Install both backend & frontend dependencies"
	@echo "  install-backend     Install backend dependencies"
	@echo "  install-frontend    Install frontend dependencies"
	@echo "  data-fetch          Fetch & ingest FRED data (runAll.ts)"
	@echo "  vectorize           Vectorize & upsert data to Pinecone (upsertFredData.ts)"
	@echo "  analysis            Run regression analysis & generate charts (analyzeFredData.ts)"
	@echo "  chat                Launch CLI chatbot session (chatWithAI.ts)"
	@echo "  api                 Start the Express API server (server.ts)"
	@echo "  frontend            Start the React frontend (npm start)"
	@echo "  docker-build        Build Docker images via docker-compose"
	@echo "  up                  Bring up services via docker-compose --build"
	@echo "  clean               Remove node_modules for both backend & frontend"
	@echo ""

install: install-backend install-frontend

install-backend:
	cd $(BACKEND_DIR) && $(NPM) install

install-frontend:
	cd $(FRONTEND_DIR) && $(NPM) install

# 1. Data ingestion (fetch + preprocess + store in MongoDB & Pinecone)
.PHONY: data-fetch
data-fetch:
	cd $(BACKEND_DIR) && $(TSX) src/runAll.ts

# 2. Vectorization & upsert to Pinecone
.PHONY: vectorize
vectorize:
	cd $(BACKEND_DIR) && $(TSX) src/upsertFredData.ts

# 3. Regression analysis and chart generation
.PHONY: analysis
analysis:
	cd $(BACKEND_DIR) && $(TSX) src/analyzeFredData.ts

# 4. CLI chatbot
.PHONY: chat
chat:
	cd $(BACKEND_DIR) && $(TSX) src/chatWithAI.ts

# 5. Start Express API server
.PHONY: api
api:
	cd $(BACKEND_DIR) && $(TSX) src/server.ts

# 6. Start React frontend
.PHONY: frontend
frontend:
	cd $(FRONTEND_DIR) && $(NPM) start

# Docker targets
.PHONY: docker-build
docker-build:
	$(DC) build

.PHONY: up
up:
	$(DC) up --build

# Cleanup
.PHONY: clean
clean:
	rm -rf $(BACKEND_DIR)/node_modules
	rm -rf $(FRONTEND_DIR)/node_modules
	@echo "Removed node_modules in backend & frontend"
