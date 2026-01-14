import { Gift, Image as ImageIcon, Layers, Shield, Sparkles, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';

const featureIcons = {
  security: Shield,
  fast: Zap,
  formats: ImageIcon,
  quality: Sparkles,
  batch: Layers,
  free: Gift,
};

export default function Features() {
  const { t } = useTranslation();

  const features = [
    {
      key: 'security',
      icon: featureIcons.security,
      title: t('features.security.title'),
      description: t('features.security.desc'),
    },
    {
      key: 'fast',
      icon: featureIcons.fast,
      title: t('features.fast.title'),
      description: t('features.fast.desc'),
    },
    {
      key: 'formats',
      icon: featureIcons.formats,
      title: t('features.formats.title'),
      description: t('features.formats.desc'),
    },
    {
      key: 'quality',
      icon: featureIcons.quality,
      title: t('features.quality.title'),
      description: t('features.quality.desc'),
    },
    {
      key: 'batch',
      icon: featureIcons.batch,
      title: t('features.batch.title'),
      description: t('features.batch.desc'),
    },
    {
      key: 'free',
      icon: featureIcons.free,
      title: t('features.free.title'),
      description: t('features.free.desc'),
    },
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">{t('features.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.key} className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
