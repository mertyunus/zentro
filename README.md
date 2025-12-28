Zentro
Zentro, React ve Node.js altyapısı üzerine kurulmuş, Socket.io kütüphanesini kullanarak anlık haberleşme sağlayan gerçek zamanlı bir mesajlaşma uygulamasıdır.

Bu projeyi geliştirmekteki temel amacım; WebSocket mantığını kavramak, istemci (Client) ile sunucu (Server) arasındaki veri akışını yönetmek ve bir mesajlaşma uygulamasının arka planda nasıl çalıştığını (oturum yönetimi, veritabanı kayıtları, anlık bildirimler) deneyimlemekti.

Projenin Özellikleri
Uygulama, standart bir mesajlaşma deneyimini simüle eden şu özelliklere sahiptir:

Anlık Mesajlaşma: Gönderilen mesajlar sayfa yenilenmeden karşı tarafa iletilir.

Okundu Bilgisi: Mesaj karşı tarafın ekranına düştüğünde ve görüldüğünde gri tik maviye döner.

Yazıyor İndikatörü: Karşı taraf klavyede bir şeyler yazarken "yazıyor..." bilgisi görünür.

Geçmiş Mesajlar: Sohbet odasına girildiğinde eski mesajlar MongoDB üzerinden çekilir.

Oturum Kontrolü: Sayfa yenilense bile kullanıcı oturumu düşmez.

Dinamik Arayüz: Kullanıcıya özel renkli avatarlar ve responsive tasarım içerir.

Kullanılan Teknolojiler
Projenin her iki tarafında da JavaScript ekosistemi tercih edilmiştir:

Frontend: React.js, CSS3, Axios

Backend: Node.js, Express.js

Haberleşme: Socket.io

Veritabanı: MongoDB

Kurulum ve Çalıştırma Rehberi
Projeyi kendi bilgisayarınızda çalıştırmak isterseniz aşağıdaki adımları takip edebilirsiniz.

1. Projenin İndirilmesi Öncelikle bu repoyu bilgisayarınıza klonlamanız veya ZIP olarak indirip bir klasöre çıkarmanız gerekmektedir.

2. Sunucu (Backend) Tarafının Hazırlanması Proje klasörünün içindeki zentroapi dizinine terminal üzerinden giriş yapın. Gerekli kütüphanelerin yüklenmesi için paket yükleme komutunu (npm install) çalıştırın.

Ardından, veritabanı bağlantısı için bu klasörde .env adında bir dosya oluşturun ve içine MONGODB_URI değişkeniyle kendi MongoDB bağlantı adresinizi ekleyin. Bu işlemden sonra sunucuyu başlatabilirsiniz (genellikle 3001 portunda çalışır).

3. Arayüz (Frontend) Tarafının Hazırlanması Yeni bir terminal penceresi açarak bu sefer zentroui klasörüne gidin. Burada da projenin çalışması için gerekli React paketlerini yükleyin. Yükleme tamamlandığında başlatma komutunu (npm start) verdiğinizde tarayıcınızda uygulama otomatik olarak açılacaktır.
