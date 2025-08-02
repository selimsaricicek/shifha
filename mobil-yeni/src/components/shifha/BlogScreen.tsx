/**
 * Blog Platformu - Hasta Deneyim Paylaşımı
 * Hastalar arası tecrübe ve diyet paylaşım platformu
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { 
  PenTool, 
  Heart, 
  MessageCircle,
  Share2,
  Search,
  Filter,
  Plus,
  Users,
  Clock,
  TrendingUp,
  Utensils,
  Activity,
  Bookmark
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './hooks/useAuth';
import { format, formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface BlogPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  title: string;
  content: string;
  category: 'experience' | 'diet' | 'exercise' | 'mental-health' | 'medication';
  tags: string[];
  likes: number;
  comments: number;
  createdAt: Date;
  isLiked?: boolean;
  condition?: string; // Hastalık türü
}

interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Date;
}

// Mock blog verileri
const mockBlogPosts: BlogPost[] = [
  {
    id: '1',
    authorId: 'user1',
    authorName: 'Ayşe K.',
    title: 'Diyabet Tanısından Sonraki İlk Yılım',
    content: 'Merhaba arkadaşlar, diyabet tanısı aldığımda çok korkmuştum. Ama şimdi 1 yıl sonra, hayatımın daha düzenli ve sağlıklı olduğunu söyleyebilirim. Kan şekerim artık kontrol altında ve yeni hobiler edindim...',
    category: 'experience',
    tags: ['diyabet', 'tanı', 'yaşam-tarzı'],
    likes: 24,
    comments: 8,
    createdAt: new Date('2024-01-20'),
    condition: 'Tip 2 Diyabet',
    isLiked: false
  },
  {
    id: '2',
    authorId: 'user2',
    authorName: 'Mehmet Y.',
    title: 'Kalp Sağlığı İçin Beslenme Planım',
    content: 'Kardiyolog önerisiyle başladığım beslenme planını sizlerle paylaşmak istiyorum. Özellikle omega-3 açısından zengin balık tüketimini artırdım, tuz kullanımımı azalttım...',
    category: 'diet',
    tags: ['kalp-sağlığı', 'beslenme', 'omega-3'],
    likes: 18,
    comments: 12,
    createdAt: new Date('2024-01-18'),
    condition: 'Hipertansiyon',
    isLiked: true
  },
  {
    id: '3',
    authorId: 'user3',
    authorName: 'Fatma D.',
    title: 'Yoga ile Stres Yönetimi Deneyimim',
    content: 'Kronik hastalığımla birlikte yaşanan stresi yönetmek için yoga yapmaya başladım. İlk başta zorlandım ama şimdi günlük rutinimin vazgeçilmez bir parçası oldu...',
    category: 'mental-health',
    tags: ['yoga', 'stres', 'mental-sağlık'],
    likes: 31,
    comments: 15,
    createdAt: new Date('2024-01-15'),
    condition: 'Fibromiyalji',
    isLiked: false
  }
];

const categoryMap = {
  'experience': { label: 'Deneyim', icon: Users, color: 'bg-blue-500' },
  'diet': { label: 'Beslenme', icon: Utensils, color: 'bg-green-500' },
  'exercise': { label: 'Egzersiz', icon: Activity, color: 'bg-orange-500' },
  'mental-health': { label: 'Mental Sağlık', icon: Heart, color: 'bg-purple-500' },
  'medication': { label: 'İlaç', icon: Plus, color: 'bg-red-500' }
};

export const BlogScreen: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [posts, setPosts] = useState<BlogPost[]>(mockBlogPosts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BlogPost['category'] | 'all'>('all');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'experience' as BlogPost['category'],
    tags: '',
    condition: ''
  });
  
  // Yorum state'leri
  const [showComments, setShowComments] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({
    '1': [
      {
        id: '1',
        postId: '1',
        authorId: 'user2',
        authorName: 'Mehmet Y.',
        content: 'Çok güzel bir deneyim paylaşımı, teşekkürler!',
        createdAt: new Date('2024-01-21')
      },
      {
        id: '2',
        postId: '1',
        authorId: 'user3',
        authorName: 'Fatma D.',
        content: 'Ben de benzer bir süreçten geçtim, çok yardımcı oldu.',
        createdAt: new Date('2024-01-22')
      }
    ],
    '2': [
      {
        id: '3',
        postId: '2',
        authorId: 'user1',
        authorName: 'Ayşe K.',
        content: 'Bu beslenme planını ben de deneyeceğim.',
        createdAt: new Date('2024-01-19')
      }
    ],
    '3': [
      {
        id: '4',
        postId: '3',
        authorId: 'user1',
        authorName: 'Ayşe K.',
        content: 'Yoga gerçekten çok faydalı, ben de başladım.',
        createdAt: new Date('2024-01-16')
      }
    ]
  });
  const [newComment, setNewComment] = useState('');

  // Filtrelenmiş postlar
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const categoryMap: Record<string, BlogPost['category']> = {
        'Tümü': 'experience',
        'Deneyim': 'experience',
        'Diyet': 'diet',
        'Egzersiz': 'exercise',
        'Mental Sağlık': 'mental-health',
        'İlaç': 'medication'
      };
      
      const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [posts, searchTerm, selectedCategory]);

  // Post beğenme
  const toggleLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked, 
            likes: post.isLiked ? post.likes - 1 : post.likes + 1 
          }
        : post
    ));
  };

  // Yorum gösterme/gizleme
  const toggleComments = (postId: string) => {
    setShowComments(prev => prev === postId ? null : postId);
  };

  // Yeni yorum ekleme
  const addComment = (postId: string) => {
    if (!newComment.trim()) {
      toast({
        title: "Boş Yorum",
        description: "Lütfen bir yorum yazın.",
        variant: "destructive"
      });
      return;
    }

    const comment: Comment = {
      id: Date.now().toString(),
      postId,
      authorId: user?.id || 'unknown',
      authorName: user?.name || 'Anonim Kullanıcı',
      content: newComment.trim(),
      createdAt: new Date()
    };

    setComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), comment]
    }));

    // Post yorum sayısını güncelle
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, comments: post.comments + 1 }
        : post
    ));

    setNewComment('');
    
    toast({
      title: "Yorum Eklendi",
      description: "Yorumunuz başarıyla eklendi.",
    });
  };

  // Yeni post oluşturma
  const createPost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast({
        title: "Eksik Bilgi",
        description: "Başlık ve içerik alanları zorunludur.",
        variant: "destructive"
      });
      return;
    }

    const post: BlogPost = {
      id: Date.now().toString(),
      authorId: user?.id || 'unknown',
      authorName: user?.name || 'Anonim Kullanıcı',
      title: newPost.title,
      content: newPost.content,
      category: newPost.category,
      tags: newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      likes: 0,
      comments: 0,
      createdAt: new Date(),
      condition: newPost.condition || undefined,
      isLiked: false
    };

    setPosts(prev => [post, ...prev]);
    setNewPost({
      title: '',
      content: '',
      category: 'experience',
      tags: '',
      condition: ''
    });
    setShowCreatePost(false);

    toast({
      title: "Gönderi Oluşturuldu",
      description: "Deneyiminizi paylaştığınız için teşekkürler!",
    });
  };

  // Kullanıcı adı kısaltma
  const getUserInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
          <Users className="w-6 h-6 text-primary" />
          Hasta Topluluğu
        </h1>
        <p className="text-muted-foreground">
          Deneyimlerinizi paylaşın, birbirinden öğrenin
        </p>
      </div>

      {/* Arama ve Filtreler */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Gönderi ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              onClick={() => setShowCreatePost(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <PenTool className="w-4 h-4 mr-2" />
              Yaz
            </Button>
          </div>

          {/* Kategori Filtreleri */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              Tümü
            </Button>
            {Object.entries(categoryMap).map(([key, category]) => {
              const Icon = category.icon;
              return (
                <Button
                  key={key}
                  variant={selectedCategory === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(key as BlogPost['category'])}
                  className="flex items-center gap-1"
                >
                  <Icon className="w-3 h-3" />
                  {category.label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Post Oluşturma Modal */}
      {showCreatePost && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenTool className="w-5 h-5" />
              Yeni Gönderi Oluştur
            </CardTitle>
            <CardDescription>
              Deneyiminizi toplulukla paylaşın
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Gönderi başlığı..."
              value={newPost.title}
              onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
            />
            
            <Textarea
              placeholder="Deneyiminizi detaylıca anlatın..."
              value={newPost.content}
              onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
              rows={6}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Kategori</label>
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost(prev => ({ ...prev, category: e.target.value as BlogPost['category'] }))}
                  className="w-full p-2 border rounded-md bg-background"
                >
                  {Object.entries(categoryMap).map(([key, category]) => (
                    <option key={key} value={key}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <Input
                placeholder="Durumunuz (opsiyonel)"
                value={newPost.condition}
                onChange={(e) => setNewPost(prev => ({ ...prev, condition: e.target.value }))}
              />
            </div>

            <Input
              placeholder="Etiketler (virgülle ayırın)"
              value={newPost.tags}
              onChange={(e) => setNewPost(prev => ({ ...prev, tags: e.target.value }))}
            />

            <div className="flex gap-2">
              <Button onClick={createPost} className="flex-1">
                <PenTool className="w-4 h-4 mr-2" />
                Paylaş
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowCreatePost(false)}
                className="flex-1"
              >
                İptal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Blog Gönderileri */}
      <div className="space-y-4">
        {filteredPosts.map((post) => {
          const categoryInfo = categoryMap[post.category];
          const CategoryIcon = categoryInfo.icon;
          
          return (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={post.authorAvatar} alt={post.authorName} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {getUserInitials(post.authorName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{post.authorName}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(post.createdAt, { addSuffix: true, locale: tr })}
                        {post.condition && (
                          <>
                            <span>•</span>
                            <span>{post.condition}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Badge variant="outline" className="flex items-center gap-1">
                    <CategoryIcon className="w-3 h-3" />
                    {categoryInfo.label}
                  </Badge>
                </div>
                
                <CardTitle className="text-lg mt-3">{post.title}</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {post.content.length > 200 
                    ? `${post.content.substring(0, 200)}...` 
                    : post.content
                  }
                </p>

                {/* Etiketler */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {post.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Etkileşim Butonları */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center gap-1 ${
                        post.isLiked ? 'text-red-500' : 'text-muted-foreground'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                      {post.likes}
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex items-center gap-1"
                      onClick={() => toggleComments(post.id)}
                    >
                      <MessageCircle className="w-4 h-4" />
                      {post.comments}
                    </Button>
                  </div>

                  <Button variant="ghost" size="sm">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Yorum Bölümü */}
                {showComments === post.id && (
                  <div className="border-t pt-4 space-y-4">
                    {/* Mevcut Yorumlar */}
                    <div className="space-y-3">
                      {(comments[post.id] || []).map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                              {getUserInitials(comment.authorName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">{comment.authorName}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(comment.createdAt, { addSuffix: true, locale: tr })}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Yeni Yorum Ekleme */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Yorumunuzu yazın..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addComment(post.id);
                          }
                        }}
                        className="flex-1"
                      />
                      <Button 
                        size="sm"
                        onClick={() => addComment(post.id)}
                        disabled={!newComment.trim()}
                      >
                        Gönder
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Sonuç Bulunamadı */}
      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            Gönderi Bulunamadı
          </h3>
          <p className="text-sm text-muted-foreground">
            Aradığınız kriterlere uygun gönderi bulunmamaktadır.
          </p>
        </div>
      )}
    </div>
  );
};