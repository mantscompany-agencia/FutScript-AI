
import React, { useState, useCallback } from 'react';
import { VideoTone, VideoGoal, AudienceType, ScriptRequest, GeneratedScript, GeneratedImage } from './types';
import { GeminiService } from './services/geminiService';
import { 
  Trophy, 
  Send, 
  Copy, 
  Download, 
  RefreshCcw, 
  CheckCircle2, 
  AlertCircle,
  Layout,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  Loader2
} from 'lucide-react';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'result'>('form');
  const [formData, setFormData] = useState<ScriptRequest>({
    topic: '',
    goal: VideoGoal.ENGAGE,
    audience: AudienceType.FAN,
    tone: VideoTone.INFORMATIVE
  });
  const [script, setScript] = useState<GeneratedScript | null>(null);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.topic.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const service = new GeminiService();
      
      // Step 1: Generate Script
      const generatedScript = await service.generateScript(formData);
      setScript(generatedScript);

      // Step 2: Generate Images
      const generatedImages = await service.generateImages(formData.topic, generatedScript.fullScript);
      setImages(generatedImages);

      setStep('result');
    } catch (err: any) {
      console.error(err);
      setError("Ocorreu um erro ao gerar o conteúdo. Verifique sua conexão ou tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadImage = (url: string, id: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `futscript-${id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500 p-2 rounded-lg">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight">FutScript <span className="text-emerald-500">AI</span></h1>
          </div>
          {step === 'result' && !loading && (
            <button 
              onClick={() => setStep('form')}
              className="text-sm font-medium flex items-center gap-2 hover:text-emerald-400 transition-colors"
            >
              <RefreshCcw className="w-4 h-4" />
              Novo Roteiro
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 sm:px-6 lg:px-8">
        {step === 'form' ? (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-4">Crie Roteiros Virais de Futebol</h2>
              <p className="text-slate-400">Poderosa IA que gera roteiros persuasivos e sketches artísticos baseados nas notícias mais recentes.</p>
            </div>

            <form onSubmit={handleGenerate} className="space-y-6 bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl">
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-300">Sobre o que é o vídeo?</label>
                <textarea
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="Ex: A polêmica do pênalti no clássico de ontem ou o possível novo time do Neymar..."
                  className="w-full h-32 bg-slate-800 border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-300">Objetivo</label>
                  <select 
                    value={formData.goal}
                    onChange={(e) => setFormData({ ...formData, goal: e.target.value as VideoGoal })}
                    className="w-full bg-slate-800 border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    {Object.values(VideoGoal).map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-300">Público-alvo</label>
                  <select 
                    value={formData.audience}
                    onChange={(e) => setFormData({ ...formData, audience: e.target.value as AudienceType })}
                    className="w-full bg-slate-800 border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    {Object.values(AudienceType).map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-300">Tom do Vídeo</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.values(VideoTone).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormData({ ...formData, tone: t })}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        formData.tone === t 
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' 
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-900/30 border border-red-800 text-red-400 rounded-xl text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  loading 
                  ? 'bg-slate-800 cursor-not-allowed text-slate-500' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Gerando seu Roteiro Mágico...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Gerar Conteúdo Automático
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Results Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <div>
                <h2 className="text-2xl font-bold mb-1">Resultado Gerado</h2>
                <p className="text-slate-400 text-sm">Pronto para Reels, TikTok e Shorts.</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => script && copyToClipboard(script.fullScript)}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold transition-all"
                >
                  {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  {copied ? 'Copiado!' : 'Copiar Roteiro'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Script Breakdown */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                  <div className="bg-slate-800 px-6 py-4 flex items-center gap-2 border-b border-slate-700">
                    <FileText className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-bold">Estrutura de Retenção</h3>
                  </div>
                  <div className="p-6 space-y-6">
                    <div>
                      <span className="inline-block px-2 py-1 bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase rounded mb-2">Gancho (Hook)</span>
                      <p className="text-lg font-medium italic text-slate-200">"{script?.hook}"</p>
                    </div>
                    <div className="h-px bg-slate-800" />
                    <div>
                      <span className="inline-block px-2 py-1 bg-blue-500/20 text-blue-500 text-[10px] font-bold uppercase rounded mb-2">Desenvolvimento</span>
                      <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{script?.body}</p>
                    </div>
                    <div className="h-px bg-slate-800" />
                    <div>
                      <span className="inline-block px-2 py-1 bg-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase rounded mb-2">CTA Final</span>
                      <p className="text-emerald-400 font-bold">{script?.cta}</p>
                    </div>
                  </div>
                </div>

                {/* Sources */}
                {script?.sources && script.sources.length > 0 && (
                  <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                     <div className="bg-slate-800 px-6 py-4 flex items-center gap-2 border-b border-slate-700">
                        <ExternalLink className="w-5 h-5 text-emerald-400" />
                        <h3 className="font-bold">Fontes Consultadas</h3>
                      </div>
                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {script.sources.map((source, i) => (
                          <a 
                            key={i} 
                            href={source.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-xs flex items-center justify-between group transition-colors"
                          >
                            <span className="truncate pr-4 text-slate-300">{source.title}</span>
                            <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 flex-shrink-0" />
                          </a>
                        ))}
                      </div>
                  </div>
                )}
              </div>

              {/* Stats/Preview Sidebar */}
              <div className="space-y-8">
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
                  <h3 className="font-bold flex items-center gap-2">
                    <Layout className="w-5 h-5 text-emerald-400" />
                    Resumo do Script
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm py-2 border-b border-slate-800">
                      <span className="text-slate-400">Tempo estimado</span>
                      <span className="text-emerald-400 font-bold">35 - 45s</span>
                    </div>
                    <div className="flex justify-between text-sm py-2 border-b border-slate-800">
                      <span className="text-slate-400">Palavras</span>
                      <span className="text-emerald-400 font-bold">{script?.fullScript.split(' ').length}</span>
                    </div>
                    <div className="flex justify-between text-sm py-2">
                      <span className="text-slate-400">Tom aplicado</span>
                      <span className="text-emerald-400 font-bold capitalize">{formData.tone}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <ImageIcon className="w-6 h-6 text-emerald-400" />
                  Galeria de Apoio (Sketches)
                </h3>
                <span className="text-slate-400 text-sm">10 imagens geradas para seu vídeo</span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {images.map((img) => (
                  <div key={img.id} className="group relative aspect-[9/16] bg-slate-900 rounded-xl border border-slate-800 overflow-hidden hover:border-emerald-500/50 transition-all">
                    <img 
                      src={img.url} 
                      alt={img.prompt} 
                      className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                      <p className="text-[10px] text-slate-300 line-clamp-2 mb-3">{img.prompt}</p>
                      <button 
                        onClick={() => downloadImage(img.url, img.id)}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        Baixar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">FutScript AI © 2024 - Criado para Criadores de Conteúdo de Elite</p>
        </div>
      </footer>
    </div>
  );
}
