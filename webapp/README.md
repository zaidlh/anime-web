# 🎬 Animax Suite — موقع ويب

موقع كامل لتحميل الأنمي واليوتيوب ورفعها إلى صفحة فيسبوك، بواجهة احترافية
(لوحة تحكم، صفحات منفصلة، تسجيل دخول بكلمة مرور)، جاهز للنشر على أي سيرفر خاص بك.

## المتطلبات على السيرفر

- Python 3.10+
- ffmpeg
- megatools

على أوبونتو/دبيان:
```bash
sudo apt-get update
sudo apt-get install -y ffmpeg megatools
```

## التثبيت

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
nano .env   # عدّل FLASK_SECRET_KEY و SITE_PASSWORD على الأقل
```

بيانات فيسبوك (Page ID / Access Token / App Secret) يمكن ضبطها هنا في `.env`،
أو لاحقاً من صفحة **الإعدادات** داخل الموقع نفسه بعد تسجيل الدخول (تُحفظ في
`instance/config.json` وتفوز على القيم في `.env`).

### كوكيز يوتيوب (اختياري لكن يُنصح به)

لتفادي خطأ "Sign in to confirm you're not a bot":
1. صدّر كوكيز يوتيوب من متصفحك عبر إضافة مثل
   [Get cookies.txt](https://chrome.google.com/webstore/detail/get-cookiestxt-locally/ccmclkhjbdinkpcefbnoaelbdgeamlen).
2. ضع الملف باسم `youtube_cookies.txt` في جذر المشروع (بجانب `app.py`).

## التشغيل أثناء التطوير

```bash
flask --app app run --debug --host 0.0.0.0 --port 5000
```
ثم افتح `http://السيرفر:5000` وسجّل الدخول بكلمة المرور من `.env`.

## التشغيل في الإنتاج (Gunicorn + Nginx)

```bash
gunicorn -w 2 -b 127.0.0.1:8000 app:app
```

مثال `systemd` service (`/etc/systemd/system/animax.service`):
```ini
[Unit]
Description=Animax Suite
After=network.target

[Service]
User=www-data
WorkingDirectory=/path/to/animax_web
Environment="PATH=/path/to/animax_web/venv/bin"
ExecStart=/path/to/animax_web/venv/bin/gunicorn -w 2 -b 127.0.0.1:8000 app:app
Restart=always

[Install]
WantedBy=multi-user.target
```

مثال إعداد Nginx كـ reverse proxy:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        client_max_body_size 2G;
    }
}
```
بعدها فعّل HTTPS بسهولة عبر `certbot --nginx`.

## ملاحظات مهمة

- **الأمان:** الموقع محمي بكلمة مرور واحدة (صفحة دخول بسيطة). غيّر `SITE_PASSWORD`
  و `FLASK_SECRET_KEY` فوراً قبل النشر، ولا تشارك رابط الموقع مع أي أحد لا تثق به —
  فهو يملك صلاحية الرفع إلى صفحتك على فيسبوك.
- **التحميلات الكبيرة:** التحميل والرفع يعملان في خيوط (threads) خلفية داخل نفس العملية.
  هذا مناسب للاستخدام الشخصي/الفريق الصغير. إن كنت تتوقع استخداماً مكثفاً من عدة
  أشخاص في وقت واحد، يُفضّل لاحقاً نقل هذه المهام إلى طابور مهام حقيقي مثل
  Celery أو RQ مع Redis.
- **المجلدات** `downloads/` و `youtube_downloads/` تُنشأ تلقائياً بجانب `app.py`
  وتحتفظ بالملفات المُحمَّلة حتى تحذفها من صفحة "الملفات الجاهزة" أو يدوياً.
- **رمز فيسبوك القديم:** إن كنت تعيد استخدام مشروع أنشأته سابقاً وكان يحتوي على
  Access Token مكتوباً مباشرة في الكود، ألغِ (revoke) ذلك التوكن القديم من إعدادات
  مطوري فيسبوك وأنشئ توكناً جديداً — لا تُدخل توكنات قديمة مسرّبة هنا.

## بنية المشروع

```
animax_web/
├── app.py                 # التطبيق الرئيسي (Flask)
├── config.py               # تحميل/حفظ الإعدادات
├── requirements.txt
├── .env.example
├── core/
│   ├── downloader.py        # تحميل الفيديو من Drive/Mega/4shared/OK
│   ├── parsers.py            # استخراج بيانات الأنمي + البحث بالاسم + بيانات يوتيوب
│   ├── facebook.py           # الرفع المُجزّأ إلى فيسبوك
│   ├── jobs.py                # تتبّع المهام الخلفية (progress/log)
│   └── library.py             # فهرس الملفات المحمّلة (instance/library.json)
├── templates/               # صفحات HTML (Jinja2)
└── static/
    ├── css/style.css
    └── js/app.js
```
