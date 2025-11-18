"use client";

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  AutoAwesome as SparkleIcon,
  Description as DocIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function KnowledgeBasePage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isGeneratingEmbeddings, setIsGeneratingEmbeddings] = useState(false);
  const [seedResult, setSeedResult] = useState<any>(null);

  // Query documents
  const documents = useQuery(api.knowledgeBase.listDocuments, {
    publishedOnly: false,
  });

  // Query categories
  const categories = useQuery(api.knowledgeBase.getCategories, {});

  // Seed knowledge base (Note: This needs to be exposed as a mutation, not internal)
  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      // You'll need to create a public mutation wrapper for seedCoreDocumentation
      alert('Seeding functionality - connect to Convex mutation');
      setIsSeeding(false);
    } catch (error) {
      console.error('Seeding error:', error);
      setIsSeeding(false);
    }
  };

  // Generate embeddings for a document
  const handleGenerateEmbeddings = async (documentId: string) => {
    setIsGeneratingEmbeddings(true);
    try {
      // Call the action to generate embeddings
      alert('Embedding generation - connect to Convex action: ' + documentId);
      setIsGeneratingEmbeddings(false);
    } catch (error) {
      console.error('Embedding error:', error);
      setIsGeneratingEmbeddings(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <SparkleIcon sx={{ fontSize: 40, color: '#10B981' }} />
          <Typography variant="h4" sx={{ color: '#FFFFFF' }}>
            AI Knowledge Base
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: '#8E8E93', mb: 3 }}>
          Manage training content for the AI Assistant. Add documentation, generate embeddings, and train the assistant on TreeShop knowledge.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={handleSeed}
            disabled={isSeeding}
            sx={{
              backgroundColor: '#10B981',
              '&:hover': { backgroundColor: '#059669' },
            }}
          >
            {isSeeding ? 'Seeding...' : 'Seed Core Docs'}
          </Button>
        </Box>
      </Box>

      {/* Seed Result */}
      {seedResult && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {seedResult.message} ({seedResult.count} documents)
        </Alert>
      )}

      {/* Categories Overview */}
      {categories && categories.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 2 }}>
            Categories
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {categories.map((cat: any) => (
              <Chip
                key={cat.category}
                label={`${cat.category} (${cat.count})`}
                sx={{
                  backgroundColor: '#2C2C2E',
                  color: '#FFFFFF',
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Documents List */}
      <Box>
        <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 2 }}>
          Documents
        </Typography>

        {!documents ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress sx={{ color: '#10B981' }} />
          </Box>
        ) : documents.length === 0 ? (
          <Alert severity="info">
            No documents yet. Click "Seed Core Docs" to add TreeShop documentation.
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {documents.map((doc: any) => (
              <Grid item xs={12} md={6} key={doc._id}>
                <Card sx={{ backgroundColor: '#1C1C1E', height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <DocIcon sx={{ color: '#10B981', mt: 0.5 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 1 }}>
                          {doc.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#8E8E93', mb: 2 }}>
                          {doc.excerpt}...
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                          <Chip
                            label={doc.category}
                            size="small"
                            sx={{ backgroundColor: '#2C2C2E', color: '#FFFFFF' }}
                          />
                          {doc.isSystemDoc && (
                            <Chip
                              label="System"
                              size="small"
                              color="primary"
                            />
                          )}
                          <Chip
                            label={`${doc.wordCount} words`}
                            size="small"
                            sx={{ backgroundColor: '#2C2C2E', color: '#8E8E93' }}
                          />
                        </Box>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<SparkleIcon />}
                          onClick={() => handleGenerateEmbeddings(doc._id)}
                          disabled={isGeneratingEmbeddings}
                          sx={{
                            borderColor: '#10B981',
                            color: '#10B981',
                            '&:hover': {
                              borderColor: '#059669',
                              backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            },
                          }}
                        >
                          Generate Embeddings
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Instructions */}
      <Box sx={{ mt: 4, p: 3, backgroundColor: '#1C1C1E', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 2 }}>
          How It Works
        </Typography>
        <Typography variant="body2" sx={{ color: '#8E8E93', mb: 1 }}>
          1. <strong>Seed Core Docs:</strong> Adds TreeShop system documentation (pricing formulas, AFISS, workflows, etc.)
        </Typography>
        <Typography variant="body2" sx={{ color: '#8E8E93', mb: 1 }}>
          2. <strong>Generate Embeddings:</strong> Creates vector embeddings for each document (required for AI search)
        </Typography>
        <Typography variant="body2" sx={{ color: '#8E8E93', mb: 1 }}>
          3. <strong>AI Assistant Uses RAG:</strong> When users ask questions, the AI searches for relevant documentation and uses it to provide accurate answers
        </Typography>
        <Typography variant="body2" sx={{ color: '#8E8E93', mt: 2 }}>
          <strong>Note:</strong> You need to set your OPENAI_API_KEY in .env.local for embeddings to work.
        </Typography>
      </Box>
    </Container>
  );
}
