/**
 * AI Sohbet Ekranı - Mental Destek
 * Hastalar için yapay zeka destekli psikolojik destek sohbeti
 */

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  User, 
  Send, 
  Heart,
  MessageCircle,
  Smile,
  AlertCircle,
  Lightbulb,
  RefreshCw, 
  Trash2,
  LogOut
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './hooks/useAuth';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  mood?: 'positive' | 'neutral' | 'concerned';
}

// Mock AI responses - gerçek uygulamada OpenAI/Anthropic API kullanılacak
const getMockAIResponse = (userMessage: string): { content: string; mood: ChatMessage['mood'] } => {
  const message = userMessage.toLowerCase();
  
  if (message.includes('üzgün') || message.includes('depresif') || message.includes('kötü')) {
    return {
      content: "Anlıyorum, zorlu bir dönemden geçiyorsunuz. Bu hisler geçici olduğunu unutmayın. Nefes egzersizleri ve hafif yürüyüş yapmak size iyi gelebilir. İhtiyacınız olursa profesyonel destek almaktan çekinmeyin. Ben her zaman buradayım. 💙",
      mood: 'concerned'
    };
  }
  
  if (message.includes('ağrı') || message.includes('acı') || message.includes('hasta')) {
    return {
      content: "Ağrınız için üzgünüm. Eğer ciddi bir rahatsızlık hissediyorsanız mutlaka doktorunuzla iletişime geçin. Hafif ağrılar için dinlenmek, bol su içmek ve stresinizi azaltmaya çalışmak faydalı olabilir. Nasıl hissettiklerini takip etmeye devam edin.",
      mood: 'concerned'
    };
  }
  
  if (message.includes('iyi') || message.includes('mutlu') || message.includes('güzel')) {
    return {
      content: "Ne kadar güzel! İyi hissettiğinizi duymak beni çok mutlu ediyor. Bu pozitif enerjiyi korumaya devam edin. Düzenli egzersiz, sağlıklı beslenme ve kaliteli uyku bu iyi hali sürdürmenize yardımcı olacaktır. 😊",
      mood: 'positive'
    };
  }
  
  if (message.includes('ilaç') || message.includes('tedavi')) {
    return {
      content: "İlaç ve tedavi konularında size destek olmaya çalışırım. Ancak unutmayın ki ben tıbbi tavsiye veremem. İlaçlarınızı düzenli kullanmak ve doktorunuzun önerilerine uymak çok önemli. Herhangi bir yan etki yaşarsanız mutlaka doktorunuza bilgi verin.",
      mood: 'neutral'
    };
  }
  
  if (message.includes('diyet') || message.includes('beslenme')) {
    return {
      content: "Sağlıklı beslenme genel sağlığınız için çok önemli! Bol sebze, meyve, tam tahıllar ve yeterli protein almaya özen gösterin. Su tüketiminizi artırın ve işlenmiş gıdalardan uzak durmaya çalışın. Diyetisyen desteği almanız da faydalı olabilir.",
      mood: 'positive'
    };
  }
  
  return {
    content: "Size nasıl yardımcı olabilirim? Mental sağlığınız, günlük rutinleriniz, sağlık durumunuz veya endişeleriniz hakkında konuşabiliriz. Ben burada size destek olmak için varım. 🤗",
    mood: 'neutral'
  };
};

export const AIChatScreen: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { logout } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: `Merhaba ${user?.name?.split(' ')[0] || 'Kullanıcı'}! Ben Shifha AI asistanınızım. Mental sağlığınızla ilgili nasıl yardımcı olabilirim? Size destek olmak için buradayım. 💙`,
      timestamp: new Date(),
      mood: 'positive'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mesaj alanını en alta kaydır
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mesaj gönderme
  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // AI yanıtını simüle et
    setTimeout(() => {
      const aiResponse = getMockAIResponse(userMessage.content);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse.content,
        timestamp: new Date(),
        mood: aiResponse.mood
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000); // 1-3 saniye arası gecikme
  };

  // Enter tuşuyla mesaj gönderme
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Hızlı yanıt butonları
  const quickResponses = [
    { text: "Kendimi iyi hissediyorum", icon: Smile },
    { text: "Ağrım var", icon: AlertCircle },
    { text: "Üzgün hissediyorum", icon: Heart },
    { text: "Beslenme önerisi istiyorum", icon: Lightbulb }
  ];

  const handleQuickResponse = (text: string) => {
    setInputMessage(text);
  };

  const handleLogout = () => {
    if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
      logout();
      toast({
        title: "Çıkış Yapıldı",
        description: "Başarıyla çıkış yaptınız.",
      });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="bg-primary p-4 text-primary-foreground">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Shifha AI Asistan</h1>
            <p className="text-sm opacity-90">Mental destek ve sağlık rehberliği</p>
          </div>
        </div>
      </div>

      {/* Mesajlar */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
              <div
                className={`rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs opacity-70">
                    {format(message.timestamp, 'HH:mm', { locale: tr })}
                  </span>
                  {message.type === 'ai' && message.mood && (
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        message.mood === 'positive' ? 'border-health-success text-health-success' :
                        message.mood === 'concerned' ? 'border-health-warning text-health-warning' :
                        'border-muted-foreground text-muted-foreground'
                      }`}
                    >
                      {message.mood === 'positive' ? '😊' : 
                       message.mood === 'concerned' ? '🤗' : '💙'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              message.type === 'user' ? 'order-1 ml-2 bg-primary/20' : 'order-2 mr-2 bg-secondary/20'
            }`}>
              {message.type === 'user' ? (
                <User className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </div>
          </div>
        ))}

        {/* Yazıyor göstergesi */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-card border rounded-lg p-3 max-w-[80%]">
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs text-muted-foreground">Shifha AI yazıyor...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Hızlı Yanıtlar */}
      {messages.length <= 2 && (
        <div className="p-4 border-t">
          <p className="text-sm text-muted-foreground mb-3">Hızlı başlangıç:</p>
          <div className="grid grid-cols-2 gap-2">
            {quickResponses.map((response, index) => {
              const Icon = response.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="justify-start h-auto p-3"
                  onClick={() => handleQuickResponse(response.text)}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  <span className="text-xs">{response.text}</span>
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Mesaj Girişi */}
      <div className="p-4 border-t bg-card">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Mesajınızı yazın..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isTyping}
            className="flex-1"
          />
          <Button 
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isTyping}
            size="sm"
            className="px-3"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mt-2 text-center">
          ⚠️ Bu AI asistan tıbbi tavsiye vermez. Acil durumlar için doktorunuza başvurun.
        </p>
      </div>
    </div>
  );
};