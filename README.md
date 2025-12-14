# .NET dependency tool

Interaktywna wizualizacja zależności między bibliotekami .NET z wykorzystaniem grafowej bazy danych.

## Technologie

- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: GraphQL, Apollo Server
- **Baza danych**: Neo4j AuraDB
- **Wizualizacja**: vis-network
- **Deploy**: Vercel

## Struktura projektu

```
projekt/
├── pages/              # Strony aplikacji
│   ├── index.tsx       # Wizualizacja grafu (strona główna)
│   ├── libraries.tsx   # Lista wszystkich bibliotek
│   ├── analytics.tsx   # Algorytmy grafowe (PageRank, analiza zależności)
│   ├── manage-nodes.tsx         # CRUD dla węzłów
│   ├── manage-relationships.tsx # CRUD dla relacji
│   └── api/
│       ├── graphql.ts  # API GraphQL
│       └── analytics.ts # API algorytmów grafowych
├── lib/
│   ├── neo4j.ts        # Połączenie z Neo4j
│   └── graphql/        # Schemat i zapytania GraphQL
└── styles/
    └── globals.css     # Style (VS Code dark theme)
```

## Instalacja lokalna

1. Sklonuj repozytorium i zainstaluj zależności:
```bash
npm install
```

2. Utwórz plik `.env.local` z danymi do Neo4j:
```env
NEO4J_URI=neo4j+s://twoj-uri.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=twoje-haslo
```

3. Uruchom serwer deweloperski:
```bash
npm run dev
```

4. Otwórz [http://localhost:3000](http://localhost:3000)

## Funkcje

- **Wizualizacja grafu**: Interaktywny graf z wyszukiwaniem węzłów
- **CRUD**: Zarządzanie bibliotekami, kategoriami, frameworkami, autorami i relacjami
- **Algorytmy grafowe**: 
  - PageRank (ranking ważności bibliotek)
  - Most Depended (najczęściej używane biblioteki)
  - Impact Analysis (analiza wpływu usunięcia biblioteki)
  - Circular Dependencies (wykrywanie cykli zależności)
- **Lista bibliotek**: Przeglądanie wszystkich bibliotek z detalami

## Deploy na Vercel

```bash
vercel login
vercel
```

Dodaj zmienne środowiskowe w Vercel Dashboard → Settings → Environment Variables.

## Model danych

### Węzły (Nodes)

Każdy węzeł reprezentuje encję w systemie:

#### Library (Biblioteka)
- `name` (string) - Nazwa biblioteki
- `version` (string) - Wersja
- `description` (string) - Opis funkcjonalności
- `repository` (string, optional) - URL do repozytorium

#### Category (Kategoria)
- `name` (string) - Nazwa kategorii (np. "ORM", "Testing", "Logging")

#### Framework (Framework docelowy)
- `name` (string) - Nazwa frameworka (np. ".NET 8", ".NET Core 6")
- `version` (string) - Wersja frameworka

#### Author (Autor/Maintainer)
- `name` (string) - Nazwa autora lub organizacji
- `url` (string, optional) - URL do strony autora

### Krawędzie (Relationships)

Relacje między węzłami definiują zależności i powiązania:

- **DEPENDS_ON**: `(Library)-[:DEPENDS_ON]->(Library)` - Biblioteka A zależy od biblioteki B
- **BELONGS_TO**: `(Library)-[:BELONGS_TO]->(Category)` - Biblioteka należy do kategorii funkcjonalnej
- **TARGETS**: `(Library)-[:TARGETS]->(Framework)` - Biblioteka wspiera dany framework
- **MAINTAINED_BY**: `(Library)-[:MAINTAINED_BY]->(Author)` - Biblioteka jest utrzymywana przez autora
- **ALTERNATIVE_TO**: `(Library)-[:ALTERNATIVE_TO]-(Library)` - Biblioteki są alternatywami (relacja dwukierunkowa)

### Diagram modelu danych (Mermaid)

```mermaid
graph LR
    L1[Library: EntityFrameworkCore<br/>name: string<br/>version: string<br/>description: string<br/>repository: string]
    L2[Library: Dapper]
    L3[Library: Microsoft.Extensions.Logging]
    
    C1[Category: ORM<br/>name: string]
    C2[Category: Logging]
    
    F1[Framework: .NET 8<br/>name: string<br/>version: string]
    
    A1[Author: Microsoft<br/>name: string<br/>url: string]
    
    L1 -->|DEPENDS_ON| L3
    L1 -->|BELONGS_TO| C1
    L1 -->|TARGETS| F1
    L1 -->|MAINTAINED_BY| A1
    L1 <-->|ALTERNATIVE_TO| L2
    
    L3 -->|BELONGS_TO| C2
    L3 -->|MAINTAINED_BY| A1
    
    style L1 fill:#0078D4,stroke:#005A9E,color:#fff
    style L2 fill:#0078D4,stroke:#005A9E,color:#fff
    style L3 fill:#0078D4,stroke:#005A9E,color:#fff
    style C1 fill:#00B7C3,stroke:#008B94,color:#fff
    style C2 fill:#00B7C3,stroke:#008B94,color:#fff
    style F1 fill:#68217A,stroke:#4B1A5C,color:#fff
    style A1 fill:#CA5010,stroke:#A74109,color:#fff
```
