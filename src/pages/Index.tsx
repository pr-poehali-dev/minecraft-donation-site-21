import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import PaymentDialog from "@/components/PaymentDialog";
import { Toaster } from "@/components/ui/toaster";

const donatPackages = [
  {
    id: 1,
    name: "VIP",
    price: "299₽",
    color: "from-purple-500 to-pink-500",
    features: [
      "Приставка [VIP]",
      "Доступ к /fly на 30 минут",
      "10 точек дома (/sethome)",
      "Кит VIP раз в день",
      "Цветной ник и чат",
      "Приоритет входа на сервер"
    ]
  },
  {
    id: 2,
    name: "PREMIUM",
    price: "599₽",
    color: "from-cyan-500 to-blue-600",
    popular: true,
    features: [
      "Приставка [PREMIUM]",
      "Неограниченный /fly",
      "30 точек дома",
      "Кит PREMIUM раз в 12 часов",
      "Цветной ник и градиент в чате",
      "Доступ к /heal и /feed",
      "Возможность создать варп",
      "Приоритет входа уровня 2"
    ]
  },
  {
    id: 3,
    name: "ELITE",
    price: "999₽",
    color: "from-orange-500 to-red-600",
    features: [
      "Приставка [ELITE]",
      "Все из PREMIUM +",
      "50 точек дома",
      "Кит ELITE раз в 6 часов",
      "Анимированный градиент в нике",
      "/god режим на 10 минут",
      "Доступ к /workbench",
      "Создание до 3 варпов",
      "Максимальный приоритет входа"
    ]
  }
];

export default function Index() {
  const [paymentDialog, setPaymentDialog] = useState<{
    open: boolean;
    packageId: string;
    packageName: string;
    packagePrice: string;
  }>({ open: false, packageId: '', packageName: '', packagePrice: '' });

  const openPayment = (id: string, name: string, price: string) => {
    setPaymentDialog({ open: true, packageId: id, packageName: name, packagePrice: price });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent"></div>
      
      <div className="relative">
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-block mb-4">
              <Badge className="text-lg px-6 py-2 bg-gradient-to-r from-primary to-secondary border-0 animate-gradient-shift bg-[length:200%_200%]">
                ⚡ Донат сервер
              </Badge>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-gradient-shift bg-[length:200%_200%]">
              MINECRAFT
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Выбери свой донат-пакет и получи крутые привилегии на сервере!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {donatPackages.map((pkg, index) => (
              <Card 
                key={pkg.id}
                className={`relative overflow-hidden border-2 hover:scale-105 transition-all duration-300 ${
                  pkg.popular ? 'border-primary shadow-2xl shadow-primary/50' : 'border-border'
                }`}
                style={{
                  animationDelay: `${index * 150}ms`
                }}
              >
                {pkg.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-secondary px-6 py-2 text-sm font-bold rounded-bl-2xl">
                    🔥 ПОПУЛЯРНЫЙ
                  </div>
                )}
                
                <div className={`h-2 bg-gradient-to-r ${pkg.color}`}></div>
                
                <div className="p-8">
                  <div className="mb-6">
                    <h3 className="text-3xl font-black mb-2">{pkg.name}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-5xl font-black bg-gradient-to-r ${pkg.color} bg-clip-text text-transparent`}>
                        {pkg.price}
                      </span>
                      <span className="text-muted-foreground">/месяц</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-8">
                    {pkg.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Icon name="Check" className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-card-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    onClick={() => openPayment(pkg.name.toLowerCase(), pkg.name, pkg.price)}
                    className={`w-full bg-gradient-to-r ${pkg.color} hover:opacity-90 text-white font-bold py-6 text-lg border-0 shadow-lg transition-all hover:shadow-xl hover:scale-105`}
                  >
                    Купить {pkg.name}
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-20 text-center animate-fade-in" style={{animationDelay: '600ms'}}>
            <Card className="inline-block p-8 bg-gradient-to-r from-card/80 to-card/60 backdrop-blur border-primary/20">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="bg-gradient-to-br from-primary to-secondary p-4 rounded-2xl animate-float">
                  <Icon name="Zap" className="w-12 h-12 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-2xl font-bold mb-2">Не знаешь что выбрать?</h3>
                  <p className="text-muted-foreground mb-4 max-w-md">
                    Свяжись с администрацией сервера и получи консультацию
                  </p>
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                    <Icon name="MessageCircle" className="w-5 h-5 mr-2" />
                    Связаться с нами
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </div>

      <PaymentDialog
        open={paymentDialog.open}
        onOpenChange={(open) => setPaymentDialog({ ...paymentDialog, open })}
        packageId={paymentDialog.packageId}
        packageName={paymentDialog.packageName}
        packagePrice={paymentDialog.packagePrice}
      />
      <Toaster />
    </div>
  );
}