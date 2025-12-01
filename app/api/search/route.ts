import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

interface SearchParam {
  field: string;
  operator: string;
  value: string;
}

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  profit: number;
  is_sold: number;
  fixed_condition: string;
  sold_exit_service: string;
  bought_price: number;
  sales_status: string;
  inventory_status: string;
  keywords: string;
  city: string;
  pref: string;
}

function loadProductData(): Product[] {
  try {
    const dataPath = join(process.cwd(), 'seed-data.json');
    const fileContent = readFileSync(dataPath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error loading product data:', error);
    return [];
  }
}

function applyFilter(products: Product[], param: SearchParam): Product[] {
  const { field, operator, value } = param;
  
  return products.filter(product => {
    const rawFieldValue = product[field as keyof Product];
    const fieldValue = String(rawFieldValue || '');
    const fieldValueLower = fieldValue.toLowerCase();
    const searchValue = value.toLowerCase();
    const numericFieldValue = Number(rawFieldValue);
    const numericSearchValue = Number(value);
    
    switch (operator) {
      // String operations
      case 'equals':
        return fieldValueLower === searchValue;
      case 'not_equals':
        return fieldValueLower !== searchValue;
      case 'contains':
        return fieldValue.includes(value); // Case sensitive
      case 'icontains':
        return fieldValueLower.includes(searchValue); // Case insensitive
      case 'not_contains':
        return !fieldValue.includes(value); // Case sensitive
      case 'starts_with':
        return fieldValueLower.startsWith(searchValue);
      case 'ends_with':
        return fieldValueLower.endsWith(searchValue);
      case 'exact_match':
        return fieldValue === value; // Case sensitive
      case 'case_insensitive':
        return fieldValueLower === searchValue;
      
      // Numeric operations
      case 'greater_than':
        return !isNaN(numericFieldValue) && !isNaN(numericSearchValue) && numericFieldValue > numericSearchValue;
      case 'less_than':
        return !isNaN(numericFieldValue) && !isNaN(numericSearchValue) && numericFieldValue < numericSearchValue;
      case 'greater_equal':
        return !isNaN(numericFieldValue) && !isNaN(numericSearchValue) && numericFieldValue >= numericSearchValue;
      case 'less_equal':
        return !isNaN(numericFieldValue) && !isNaN(numericSearchValue) && numericFieldValue <= numericSearchValue;
      case 'between':
        const [min, max] = value.split(',').map(v => Number(v.trim()));
        return !isNaN(numericFieldValue) && !isNaN(min) && !isNaN(max) && numericFieldValue >= min && numericFieldValue <= max;
      case 'not_between':
        const [minNot, maxNot] = value.split(',').map(v => Number(v.trim()));
        return !isNaN(numericFieldValue) && !isNaN(minNot) && !isNaN(maxNot) && (numericFieldValue < minNot || numericFieldValue > maxNot);
      
      // Array/List operations
      case 'in':
        const inList = value.split(',').map(v => v.trim().toLowerCase());
        return inList.includes(fieldValueLower);
      case 'not_in':
        const notInList = value.split(',').map(v => v.trim().toLowerCase());
        return !notInList.includes(fieldValueLower);
      
      // Null/Empty operations
      case 'is_null':
        return !rawFieldValue || rawFieldValue === '' || rawFieldValue === null || rawFieldValue === undefined;
      case 'is_not_null':
        return rawFieldValue && rawFieldValue !== '' && rawFieldValue !== null && rawFieldValue !== undefined;
      
      // Regular expressions
      case 'regex':
        try {
          const regex = new RegExp(value, 'i');
          return regex.test(fieldValue);
        } catch {
          return false;
        }
      case 'not_regex':
        try {
          const regex = new RegExp(value, 'i');
          return !regex.test(fieldValue);
        } catch {
          return true;
        }
      
      // Fuzzy matching
      case 'fuzzy':
        return calculateLevenshteinDistance(fieldValueLower, searchValue) <= Math.max(1, Math.floor(searchValue.length * 0.2));
      case 'wildcard':
        const wildcardRegex = new RegExp(
          '^' + value.replace(/\*/g, '.*').replace(/\?/g, '.') + '$',
          'i'
        );
        return wildcardRegex.test(fieldValue);
      
      // Semantic search
      case 'semantic':
        // TODO: Implement AI/vector search - for now, fall back to enhanced keyword matching
        const semanticWords = searchValue.split(/\s+/);
        return semanticWords.some(word => 
          fieldValueLower.includes(word) || 
          calculateSemanticSimilarity(fieldValueLower, word)
        );
      
      default:
        return true;
    }
  });
}

// Helper function for fuzzy matching using Levenshtein distance
function calculateLevenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i;
  }
  
  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j;
  }
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

// Helper function for semantic similarity (placeholder for AI/vector search)
function calculateSemanticSimilarity(text: string, searchTerm: string): boolean {
  // Simple semantic mapping for demo purposes
  // In production, this would use AI embeddings/vector search
  const semanticMappings: Record<string, string[]> = {
    'phone': ['smartphone', 'mobile', 'cell', 'iphone', 'galaxy', 'pixel'],
    'camera': ['photo', 'photography', 'lens', 'canon', 'nikon', 'fuji'],
    'laptop': ['computer', 'notebook', 'macbook', 'thinkpad', 'surface'],
    'gaming': ['game', 'play', 'rog', 'razer', 'alienware', 'msi'],
    'audio': ['sound', 'music', 'headphone', 'speaker', 'beats'],
    'beautiful': ['good', 'excellent', 'nice', 'great', 'amazing'],
    'cheap': ['affordable', 'budget', 'low', 'economic'],
    'expensive': ['premium', 'high-end', 'luxury', 'pro'],
  };
  
  for (const [concept, synonyms] of Object.entries(semanticMappings)) {
    if (searchTerm.includes(concept)) {
      return synonyms.some(synonym => text.includes(synonym));
    }
    if (synonyms.includes(searchTerm)) {
      return text.includes(concept) || synonyms.some(synonym => text.includes(synonym));
    }
  }
  
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now();
    const body = await request.json();
    const { searchParams, sortBy, sortOrder = 'asc', limit } = body;

    if (!searchParams || !Array.isArray(searchParams)) {
      return NextResponse.json(
        { error: 'Invalid search parameters' },
        { status: 400 }
      );
    }

    // Load product data
    let products = loadProductData();
    
    if (products.length === 0) {
      return NextResponse.json(
        { error: 'No product data available' },
        { status: 500 }
      );
    }

    // Apply filters sequentially (AND logic)
    for (const param of searchParams) {
      if (param.field && param.operator && param.value) {
        products = applyFilter(products, param);
      }
    }

    // Apply sorting
    if (sortBy) {
      products.sort((a, b) => {
        const aValue = a[sortBy as keyof Product];
        const bValue = b[sortBy as keyof Product];
        
        // Handle numeric sorting
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        // Handle string sorting
        const aStr = String(aValue || '').toLowerCase();
        const bStr = String(bValue || '').toLowerCase();
        
        if (sortOrder === 'asc') {
          return aStr.localeCompare(bStr);
        } else {
          return bStr.localeCompare(aStr);
        }
      });
    }

    // Apply limit
    const totalCount = products.length;
    if (limit && !isNaN(Number(limit))) {
      products = products.slice(0, Number(limit));
    }

    const searchTime = Date.now() - startTime;

    return NextResponse.json({
      results: products,
      count: products.length,
      totalCount,
      searchTime,
      appliedFilters: searchParams.filter((p: SearchParam) => p.field && p.operator && p.value),
      sorting: sortBy ? { field: sortBy, order: sortOrder } : null,
      limit: limit ? Number(limit) : null
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle GET requests (for testing)
export async function GET() {
  const products = loadProductData();
  return NextResponse.json({
    message: 'Search API is working',
    totalProducts: products.length,
    sampleProduct: products[0] || null
  });
}