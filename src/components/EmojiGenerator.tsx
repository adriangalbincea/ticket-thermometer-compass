import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Sparkles, ImageIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface GeneratedEmoji {
  type: string;
  url: string;
  fileName: string;
  downloadUrl: string;
}

export const EmojiGenerator: React.FC = () => {
  const [generatedEmojis, setGeneratedEmojis] = useState<GeneratedEmoji[]>([]);
  const [loadingTypes, setLoadingTypes] = useState<Set<string>>(new Set());
  const [allGenerated, setAllGenerated] = useState(false);
  const { toast } = useToast();

  const emojiTypes = [
    { type: 'sad', label: 'Sad 😢', description: 'Sad face with tears' },
    { type: 'neutral', label: 'Neutral 😐', description: 'Neutral expression' },
    { type: 'happy', label: 'Happy 😊', description: 'Happy smiling face' }
  ];

  const generateEmoji = async (type: string) => {
    setLoadingTypes(prev => new Set(prev).add(type));
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-emoji', {
        body: { type }
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        const newEmoji = {
          type: data.type,
          url: data.url,
          fileName: data.fileName,
          downloadUrl: data.downloadUrl
        };

        setGeneratedEmojis(prev => {
          const filtered = prev.filter(emoji => emoji.type !== type);
          return [...filtered, newEmoji];
        });

        toast({
          title: "Success!",
          description: `${type.charAt(0).toUpperCase() + type.slice(1)} emoji generated successfully!`,
        });
      } else {
        throw new Error(data.error || 'Failed to generate emoji');
      }
    } catch (error: any) {
      console.error('Error generating emoji:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to generate emoji. Please try again.',
        variant: "destructive",
      });
    } finally {
      setLoadingTypes(prev => {
        const newSet = new Set(prev);
        newSet.delete(type);
        return newSet;
      });
    }
  };

  const generateAllEmojis = async () => {
    setAllGenerated(true);
    
    for (const emojiType of emojiTypes) {
      if (!generatedEmojis.find(emoji => emoji.type === emojiType.type)) {
        await generateEmoji(emojiType.type);
        // Small delay between generations to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    setAllGenerated(false);
  };

  const downloadEmoji = async (emoji: GeneratedEmoji) => {
    try {
      const response = await fetch(emoji.downloadUrl);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${emoji.type}-emoji.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Downloaded!",
        description: `${emoji.type.charAt(0).toUpperCase() + emoji.type.slice(1)} emoji downloaded successfully!`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: 'Failed to download emoji. Please try again.',
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Emoji Generator
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Generate custom emojis for web and email use. All emojis are created as PNG files with transparent backgrounds.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline">Powered by Hugging Face FLUX</Badge>
            <Badge variant="secondary">PNG Format</Badge>
          </div>
          <Button 
            onClick={generateAllEmojis}
            disabled={allGenerated || loadingTypes.size > 0}
            variant="outline"
          >
            {allGenerated ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {allGenerated ? 'Generating All...' : 'Generate All 3'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {emojiTypes.map(({ type, label, description }) => {
            const isLoading = loadingTypes.has(type);
            const generated = generatedEmojis.find(emoji => emoji.type === type);
            
            return (
              <div key={type} className="border rounded-lg p-4 space-y-3">
                <div className="text-center">
                  <h3 className="font-semibold">{label}</h3>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
                
                {generated ? (
                  <div className="space-y-3">
                    <div className="flex justify-center">
                      <img 
                        src={generated.url} 
                        alt={`${type} emoji`}
                        className="w-20 h-20 object-contain border rounded"
                      />
                    </div>
                    <Button 
                      onClick={() => downloadEmoji(generated)}
                      size="sm" 
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download PNG
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-center">
                      <div className="w-20 h-20 border-2 border-dashed border-muted-foreground rounded flex items-center justify-center">
                        {isLoading ? (
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        ) : (
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <Button 
                      onClick={() => generateEmoji(type)}
                      disabled={isLoading}
                      size="sm" 
                      className="w-full"
                      variant="outline"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-muted rounded-lg p-4">
          <h3 className="font-semibold text-sm mb-2">Usage Instructions</h3>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>• Click "Generate All 3" to create all emojis at once</p>
            <p>• Click individual "Generate" buttons for specific emojis</p>
            <p>• All emojis are PNG format with transparent backgrounds</p>
            <p>• Perfect for web pages, emails, and marketing materials</p>
            <p>• High quality images generated using AI</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};