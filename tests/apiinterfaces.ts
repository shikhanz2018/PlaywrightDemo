// apiInterfaces.ts

// Interfaces for the character API response
export interface CharacterThumbnail {
    path: string;
    extension: string;
  }
  
  export interface CharacterComics {
    available: number;
    collectionURI: string;
    returned: number;
  }
  
  export interface CharacterResult {
    id: number;
    name: string;
    description: string;
    modified: string;
    thumbnail: CharacterThumbnail;
    comics: CharacterComics;
  }
  
  export interface CharacterApiResponse {
    code: number;
    status: string;
    data: {
      offset: number;
      limit: number;
      total: number;
      count: number;
      results: CharacterResult[];
    };
  }
  
  // Interfaces for the comic API response
  export interface ComicThumbnail {
    path: string;
    extension: string;
  }
  
  export interface ComicResult {
    thumbnail: ComicThumbnail;
  }
  
  export interface ComicApiResponse {
    code: number;
    status: string;
    data: {
      offset: number;
      limit: number;
      total: number;
      count: number;
      results: ComicResult[];
    };
  }
  