import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageId: string;
  packageName: string;
  packagePrice: string;
}

const paymentMethods = [
  { id: 'stripe', name: 'Stripe', icon: 'CreditCard', description: 'Карты, Apple Pay, Google Pay' },
  { id: 'freekassa', name: 'Freekassa', icon: 'Wallet', description: 'Все методы оплаты' },
  { id: 'yukassa', name: 'ЮKassa', icon: 'Banknote', description: 'СБП, карты, кошельки' }
];

export default function PaymentDialog({ open, onOpenChange, packageId, packageName, packagePrice }: PaymentDialogProps) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    if (!email || !username) {
      toast({
        title: 'Заполните все поля',
        description: 'Email и никнейм обязательны для оплаты',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://functions.poehali.dev/c86a77e8-d1a7-4f47-9093-0f21a99ef9eb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          package_id: packageId,
          payment_method: paymentMethod,
          email,
          minecraft_username: username
        })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.payment_url.startsWith('#')) {
          toast({
            title: 'Платёжная система не настроена',
            description: 'Администратор ещё не добавил ключи API для выбранного метода оплаты',
            variant: 'destructive'
          });
        } else {
          window.location.href = data.payment_url;
        }
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось создать платёж',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка сети',
        description: 'Проверьте подключение к интернету',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Оплата {packageName}
          </DialogTitle>
          <DialogDescription>
            Стоимость: {packagePrice}/месяц
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Minecraft никнейм</Label>
            <Input
              id="username"
              type="text"
              placeholder="Steve123"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={16}
            />
          </div>

          <div className="space-y-3">
            <Label>Способ оплаты</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => setPaymentMethod(method.id)}
                >
                  <RadioGroupItem value={method.id} id={method.id} />
                  <div className="flex items-center gap-3 flex-1">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Icon name={method.icon as any} className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <Label htmlFor={method.id} className="font-semibold cursor-pointer">
                        {method.name}
                      </Label>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold py-6 text-lg"
          >
            {loading ? (
              <>
                <Icon name="Loader2" className="w-5 h-5 mr-2 animate-spin" />
                Обработка...
              </>
            ) : (
              <>
                <Icon name="CreditCard" className="w-5 h-5 mr-2" />
                Перейти к оплате
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
