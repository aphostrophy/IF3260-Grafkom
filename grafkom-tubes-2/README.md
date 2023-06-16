# Tugas Besar 2 IF3250 Grafika Komputer

### Panduan Instalasi
1. Download zip atau clone repository ini
2. Pastika npm sudah terinstall
3. Jalankan command `npm install` untuk menginstall pakcage yang diperlukan 
4. Jalankan website dengan command `npm run dev`


### Manual/Contoh Fungsionalitas
Berikut ini adalah penjelasan terkait fungsionalitas dari program yang telah kamu buat. Program ini memiliki beberapa fungsionalitas yang dapat digunakan, antara lain:

### Menjalankan Program
Jalankan perintah npm run dev pada command program di directory source code
Pengguna mungkin perlu meng-install dependency lainnya, apabila diperintahkan oleh sistem
Setelah server berhasil dijalankan, akan diberikan alamat local host yang dapat dibuka.

### Mengubah Jenis Proyeksi
Pengguna dapat mengubah jenis proyeksi dari objek hollow pada canvas yang dapat dilakukan dengan menekan tombol binding, yaitu
Binding tombol 1 : Mengubah tipe proyeksi menjadi Perspective (Default)
Binding tombol 2: Mengubah tipe proyeksi menjadi Orthographic
Binding tombol 3 : Mengubah tipe proyeksi menjadi Oblique

### Melakukan Rotasi, Translasi, dan Scaling
Pengguna dapat melakukan rotasi dari object hollow di canvas dengan menekan tombol binding, yaitu
Binding tombol F dan H : Melakukan rotasi terhadap sumbu X objek
Binding tombol T dan G : Melakukan rotasi terhadap sumbu Y objek

### Melakukan Translasi
Pengguna dapat melakukan translasi dari object hollow di canvas dengan menekan tombol binding, yaitu
Binding tombol J dan L : Melakukan translasi sepanjang sumbu X
Binding tombol I dan K : Melakukan translasi sepanjang sumbu Y
Binding tombol O dan P : Melakukan translasi sepanjang sumbu Z

### Melakukan Scaling
Pengguna dapat melakukan scaling dari object hollow di canvas dengan menekan tombol binding, yaitu 
Binding tombol koma (,): Melakukan scale down pada objek sehingga mengecil
Binding tombol titik (.): Melakukan scale up pada objek sehingga membesar


### Mengubah Jarak (Radius) Camera View
Pengguna dapat mengubah jarak dari kamera dengan melakukan scroll dengan mouse wheel dan menekan tombol binding, yaitu
Binding tombol A dan D : Mengubah jarak radius  pada sumbu Y dunia
Binding tombol W dan S :  Mengubah jarak radius pada sumbu X dunia
Scrollwheel Up dan Down :  Mengubah jarak radius pada sumbu Z dunia

###Me-reset ke Default View
Pengguna dapat me-reset objek yang sudah diaplikasikan translasi, scaling, rotasi, serta me-reset camera view, dengan menekan tombol binding “R” pada keyboard.

### Membuat Menu Help
Pengguna dapat mengakses fitur menu help untuk melihat tata cara atau manual dari penggunaan web hasil implementasi webGL ini dengan menekan link “Help Page” yang ada di bawah canvas

### Membuat shading
Pengguna dapat mengaktifkan atau menonaktifkan fungsionalitas shading dengan menekan tombol binding “M” pada keyboard.

### Fungsi load objek
Pengguna dapat melakukan load objek lain dengan menekan binding yaitu,
Binding tombol 6: Melakukan load objek box
Binding tombol 7: Melakukan load objek torus
Binding tombol 8: Melakukan load objek knot
Binding tombol 9: Melakukan load objek prism

