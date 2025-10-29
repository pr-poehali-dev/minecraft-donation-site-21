'''
Business: Create payment links for Stripe, Freekassa, and YooKassa
Args: event with httpMethod, body containing package_id, payment_method, email, minecraft_username
      context with request_id attribute
Returns: HTTP response with payment URL or error
'''

import json
import os
import hashlib
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field, EmailStr


class PaymentRequest(BaseModel):
    package_id: str = Field(..., min_length=1)
    payment_method: str = Field(..., pattern='^(stripe|freekassa|yukassa)$')
    email: EmailStr
    minecraft_username: str = Field(..., min_length=3, max_length=16)


PACKAGES = {
    'vip': {'name': 'VIP', 'price': 299},
    'premium': {'name': 'PREMIUM', 'price': 599},
    'elite': {'name': 'ELITE', 'price': 999}
}


def create_stripe_payment(package: Dict[str, Any], email: str, username: str) -> str:
    stripe_key = os.environ.get('STRIPE_SECRET_KEY', '')
    if not stripe_key:
        return f'#stripe-not-configured'
    
    return f'https://stripe.com/pay?amount={package["price"]}&currency=rub&email={email}&metadata[username]={username}'


def create_freekassa_payment(package: Dict[str, Any], email: str, username: str, order_id: str) -> str:
    shop_id = os.environ.get('FREEKASSA_SHOP_ID', '')
    secret = os.environ.get('FREEKASSA_SECRET_KEY', '')
    
    if not shop_id or not secret:
        return f'#freekassa-not-configured'
    
    amount = package['price']
    sign_string = f"{shop_id}:{amount}:{secret}:{order_id}"
    sign = hashlib.md5(sign_string.encode()).hexdigest()
    
    return f'https://pay.freekassa.com/?m={shop_id}&oa={amount}&o={order_id}&s={sign}&em={email}&us={username}'


def create_yukassa_payment(package: Dict[str, Any], email: str, username: str, order_id: str) -> str:
    shop_id = os.environ.get('YUKASSA_SHOP_ID', '')
    secret = os.environ.get('YUKASSA_SECRET_KEY', '')
    
    if not shop_id or not secret:
        return f'#yukassa-not-configured'
    
    return f'https://yookassa.ru/checkout/payments?shopId={shop_id}&sum={package["price"]}&customerContact={email}&orderId={order_id}'


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    payment_req = PaymentRequest(**body_data)
    
    package = PACKAGES.get(payment_req.package_id.lower())
    if not package:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid package ID'})
        }
    
    order_id = f'{context.request_id[:8]}-{payment_req.package_id}'
    
    try:
        if payment_req.payment_method == 'stripe':
            payment_url = create_stripe_payment(package, payment_req.email, payment_req.minecraft_username)
        elif payment_req.payment_method == 'freekassa':
            payment_url = create_freekassa_payment(package, payment_req.email, payment_req.minecraft_username, order_id)
        elif payment_req.payment_method == 'yukassa':
            payment_url = create_yukassa_payment(package, payment_req.email, payment_req.minecraft_username, order_id)
        else:
            raise ValueError('Invalid payment method')
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({
                'payment_url': payment_url,
                'order_id': order_id,
                'package': package['name'],
                'amount': package['price']
            })
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }