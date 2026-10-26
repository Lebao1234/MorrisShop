/**
 * Dữ liệu mẫu thực tế trích xuất từ https://www.morrismotley.com/
 * Bao gồm video hero, poster, banner danh mục và ảnh sản phẩm chính thức.
 */

export const categories = [
  {
    "key": "sap",
    "name": "Sáp vuốt tóc & Tạo kiểu",
    "slug": "sap-vuot-toc",
    "description": "Sáp tạo kiểu thủ công cao cấp, mang lại kết cấu tóc tự nhiên, độ giữ nếp linh hoạt và dưỡng chất phục hồi.",
    "image": "https://www.morrismotley.com/cdn/shop/files/HAIR_STYLING.jpg?v=1721262850&width=1600",
    "position": 1
  },
  {
    "key": "goi",
    "name": "Dầu gội & Dưỡng tóc",
    "slug": "dau-goi-duong-toc",
    "description": "Công thức làm sạch sâu dịu nhẹ và cân bằng hệ vi sinh da đầu, nuôi dưỡng sợi tóc chắc khoẻ từ gốc.",
    "image": "https://www.morrismotley.com/cdn/shop/files/HAIR_CLEANSING.jpg?v=1721262806&width=1600",
    "position": 2
  },
  {
    "key": "body",
    "name": "Chăm sóc cơ thể & Rửa tay",
    "slug": "cham-soc-co-the",
    "description": "Sữa tắm dưỡng ẩm và nước rửa tay chứa tinh dầu thực vật cao cấp, mang lại cảm giác thư giãn như tại spa.",
    "image": "https://www.morrismotley.com/cdn/shop/files/BODYWASH.jpg?v=1721262475&width=1600",
    "position": 3
  },
  {
    "key": "perfume",
    "name": "Nước hoa Extrait De Parfum",
    "slug": "nuoc-hoa-cao-cap",
    "description": "Bộ sưu tập Extrait De Parfum nồng độ tinh dầu cao với các nốt hương hiếm, gợi cảm và lưu hương bền bỉ.",
    "image": "https://www.morrismotley.com/cdn/shop/files/EXTRAIT_DE_PARFUM.jpg?v=1721262511&width=1600",
    "position": 4
  },
  {
    "key": "combo",
    "name": "Combo & Gói Refill",
    "slug": "combo-cham-soc",
    "description": "Bộ sản phẩm chăm sóc toàn diện phối sẵn và các gói refill tiết kiệm, thân thiện với môi trường.",
    "image": "https://www.morrismotley.com/cdn/shop/files/REFILL_SACHETS.jpg?v=1721262825&width=1600",
    "position": 5
  }
];

export const products = [
  {
    "categoryKey": "sap",
    "name": "Matte Styling Balm",
    "shortDescription": "Hũ sáp tạo phom mờ trứ danh của Morris Motley. Giữ nếp cực cao, không bóng dầu, dưỡng tóc mềm mại.",
    "description": "Matte Styling Balm là dòng sản phẩm định hình tên tuổi của Morris Motley trên toàn thế giới. Công thức kết hợp đất sét khoáng bentonite với tinh dầu hạt jojoba và sáp thực vật cao cấp, mang lại độ giữ nếp cực mạnh suốt ngày dài nhưng tóc vẫn giữ được sự bồng bềnh, dễ luồn tay chải lại mà không hề bết dính. Kết thúc mờ tự nhiên tuyệt đối, dễ dàng gội sạch chỉ với một lần xả nước ấm.",
    "images": [
      "https://www.morrismotley.com/cdn/shop/files/MatteStylingBalmjarlargersize.png?v=1698363780",
      "https://www.morrismotley.com/cdn/shop/files/IMG_2033.jpg?v=1746156316"
    ],
    "hairType": [
      "tóc thẳng",
      "tóc dày",
      "mọi loại tóc"
    ],
    "holdLevel": "high",
    "finish": "matte",
    "ingredients": "Aqua, Bentonite, Kaolin Clay, Simmondsia Chinensis (Jojoba) Seed Oil, Cera Alba, Cetearyl Alcohol, Panthenol, Keratin Amino Acids, Santalum Album (Sandalwood) Oil, Phenoxyethanol.",
    "howToUse": "Lấy một lượng nhỏ cỡ hạt đậu ra lòng bàn tay, xoa đều cho sáp tan và ấm lên. Vuốt đều từ chân tóc ra ngọn trên nền tóc khô hoặc ẩm nhẹ. Dùng các ngón tay cào tạo nếp tự nhiên hoặc chải lược theo kiểu tóc mong muốn.",
    "tags": [
      "bestseller",
      "matte",
      "sap"
    ],
    "variants": [
      {
        "name": "50g",
        "price": 750000,
        "salePrice": 690000,
        "stock": 45
      },
      {
        "name": "100g",
        "price": 1250000,
        "salePrice": 0,
        "stock": 30
      }
    ],
    "soldCount": 428
  },
  {
    "categoryKey": "sap",
    "name": "Crème Styling Masque",
    "shortDescription": "Kem ủ tạo kiểu giàu keratin và tinh dầu jojoba. Giữ nếp vừa, kết cấu mềm mượt và định hình lọn tóc.",
    "description": "The Crème Styling Masque là giải pháp lai giữa mặt nạ dưỡng tóc chuyên sâu và kem tạo kiểu nhẹ nhàng. Sản phẩm cung cấp độ ẩm tức thì cho những mái tóc khô cứng, dễ gãy rụng, giúp định hình lọn tóc tự nhiên và kiểm soát các sợi tóc con. Rất lý tưởng khi dùng làm pre-styler trước bước sáp Matte Styling Balm hoặc dùng độc lập cho phong cách lãng tử buông lơi.",
    "images": [
      "https://cdn.shopify.com/s/files/1/0384/1238/6443/files/Creme_Styling_Masque_jar_larger_size_copy.png?v=1753155274",
      "https://cdn.shopify.com/s/files/1/0384/1238/6443/files/CSM3Qtranscopy_1.png?v=1753155274",
      "https://cdn.shopify.com/s/files/1/0384/1238/6443/files/MorrisMotley_CremeStylingMasque_Cropped_1.png?v=1753155274"
    ],
    "hairType": [
      "tóc uốn",
      "tóc xoăn",
      "tóc khô xơ",
      "tóc mỏng"
    ],
    "holdLevel": "medium",
    "finish": "natural",
    "ingredients": "Aqua, Cetearyl Alcohol, Hydrolyzed Keratin, Simmondsia Chinensis Seed Oil, Behentrimonium Methosulfate, Argania Spinosa Kernel Oil, Butyrospermum Parkii (Shea) Butter, Parfum.",
    "howToUse": "Thoa đều một lượng nhỏ lên tóc ẩm sau khi gội. Có thể để khô tự nhiên hoặc sấy với đầu khuếch tán nhiệt nhẹ để định hình sóng tóc.",
    "tags": [
      "new",
      "sap",
      "creme"
    ],
    "variants": [
      {
        "name": "100g",
        "price": 1200000,
        "salePrice": 1090000,
        "stock": 35
      }
    ],
    "soldCount": 196
  },
  {
    "categoryKey": "goi",
    "name": "Conditioning Crème Shampoo",
    "shortDescription": "Dầu gội phục hồi cao cấp dạng kem. Làm sạch nhẹ nhàng, dưỡng ẩm da đầu và không làm mất độ ẩm tự nhiên.",
    "description": "Một công thức làm sạch dạng kem đậm đặc, không chứa sulfates độc hại. Conditioning Crème Shampoo kết hợp các amino acid thực vật giúp loại bỏ sạch bụi bẩn, dầu thừa và cặn sáp tạo kiểu tích tụ mà vẫn giữ cho hàng rào bảo vệ da đầu luôn ẩm mượt, khoẻ khoắn.",
    "images": [
      "https://www.morrismotley.com/cdn/shop/files/CCSBOTTLEFRONT.png?v=1698363719",
      "https://www.morrismotley.com/cdn/shop/files/IMG_2032.jpg?v=1698363719"
    ],
    "hairType": [
      "mọi loại tóc",
      "tóc khô xơ",
      "tóc qua hoá chất"
    ],
    "holdLevel": "low",
    "finish": "natural",
    "ingredients": "Aqua, Sodium Lauroyl Methyl Isethionate, Cocamidopropyl Betaine, Glycerin, Glycol Distearate, Panthenol, Camellia Sinensis Leaf Extract, Aloe Barbadensis Leaf Juice, Citrus Junos Peel Oil.",
    "howToUse": "Làm ướt toàn bộ tóc. Lấy 1-2 pump xoa đều tạo bọt mịn, massage kỹ da đầu trong 2 phút rồi xả sạch bằng nước mát.",
    "tags": [
      "bestseller",
      "dau-goi"
    ],
    "variants": [
      {
        "name": "500ml",
        "price": 1100000,
        "salePrice": 0,
        "stock": 50
      }
    ],
    "soldCount": 342
  },
  {
    "categoryKey": "goi",
    "name": "Anti-Dandruff Conditioning Shampoo",
    "shortDescription": "Dầu gội trị gàu và cân bằng da đầu. Làm dịu ngứa tức thì, kháng khuẩn và nuôi dưỡng ngọn tóc suôn mượt.",
    "description": "Giải pháp triệt để cho da đầu bị bong tróc gàu và ngứa rát. Tích hợp hoạt chất kháng nấm dịu nhẹ cùng chiết xuất thảo mộc làm mát, giúp làm sạch mảng gàu ngay từ lần gội đầu tiên mà không làm khô cứng thân tóc như các loại dầu gội thông thường.",
    "images": [
      "https://www.morrismotley.com/cdn/shop/files/ADSBOTTLEFRONT.png?v=1698363416",
      "https://www.morrismotley.com/cdn/shop/files/IMG_2039.jpg?v=1698363416"
    ],
    "hairType": [
      "da đầu gàu",
      "da đầu dầu",
      "tóc ngứa rát"
    ],
    "holdLevel": "low",
    "finish": "natural",
    "ingredients": "Aqua, Zinc Pyrithione, Melaleuca Alternifolia (Tea Tree) Leaf Oil, Mentha Piperita Oil, Rosmarinus Officinalis Extract, Sodium Cocoyl Isethionate, Citric Acid.",
    "howToUse": "Thoa đều lên da đầu ướt, massage nhẹ nhàng các vùng xuất hiện gàu trong 3 phút để hoạt chất phát huy hiệu quả rồi xả sạch.",
    "tags": [
      "dau-goi",
      "anti-dandruff"
    ],
    "variants": [
      {
        "name": "500ml",
        "price": 1150000,
        "salePrice": 990000,
        "stock": 42
      }
    ],
    "soldCount": 285
  },
  {
    "categoryKey": "body",
    "name": "Supermassive Crème Bodywash",
    "shortDescription": "Sữa tắm dạng kem siêu dưỡng ẩm với hương thơm gỗ khói ấm áp và khoáng chất hồi sinh làn da.",
    "description": "Supermassive mang đến trải nghiệm tắm rửa thư thái với lớp bọt dày sánh mịn như lụa. Chiết xuất từ các loại hạt rừng nguyên sinh của Úc giúp phục hồi độ ẩm cho làn da sau ngày dài làm việc, vương lại nốt hương gỗ và thảo mộc bí ẩn đầy nam tính.",
    "images": [
      "https://www.morrismotley.com/cdn/shop/files/SMCBWBOTTLEFRONT.png?v=1698363838",
      "https://www.morrismotley.com/cdn/shop/files/IMG_2027.jpg?v=1698363838"
    ],
    "hairType": [
      "mọi loại da"
    ],
    "holdLevel": "low",
    "finish": "natural",
    "ingredients": "Aqua, Sodium Cocoyl Glycinate, Macadamia Ternifolia Seed Oil, Theobroma Cacao Seed Butter, Cedarwood Oil, Vetiver Root Oil, Tocopheryl Acetate.",
    "howToUse": "Lấy 2 pump ra bông tắm hoặc lòng bàn tay, tạo bọt đều khắp cơ thể và tận hưởng hương thơm thư giãn trước khi xả sạch bằng nước ấm.",
    "tags": [
      "bodywash",
      "creme"
    ],
    "variants": [
      {
        "name": "500ml",
        "price": 980000,
        "salePrice": 0,
        "stock": 40
      }
    ],
    "soldCount": 178
  },
  {
    "categoryKey": "body",
    "name": "Exfoliating Granule Bodywash",
    "shortDescription": "Sữa tắm tẩy tế bào chết hạt vi khoáng núi lửa. Tái tạo bề mặt da láng mịn và sáng khoẻ.",
    "description": "Kết hợp giữa gel làm sạch tươi mát và các vi hạt khoáng chất mài nhẵn tự nhiên, Exfoliating Granule Bodywash nhẹ nhàng đánh bay lớp sừng khô ráp ở khuỷu tay, lưng và bắp tay, thông thoáng lỗ chân lông và ngăn ngừa mụn lưng hiệu quả.",
    "images": [
      "https://www.morrismotley.com/cdn/shop/files/EGBWBOTTLEFRONT.png?v=1698363749",
      "https://www.morrismotley.com/cdn/shop/files/IMG_2038.jpg?v=1698363749"
    ],
    "hairType": [
      "da dầu",
      "da thô ráp",
      "da mụn lưng"
    ],
    "holdLevel": "low",
    "finish": "natural",
    "ingredients": "Aqua, Volcanic Ash Minerals, Jojoba Esters, Decyl Glucoside, Eucalyptus Globulus Leaf Oil, Salicylic Acid, Glycerin.",
    "howToUse": "Dùng 2-3 lần mỗi tuần. Thoa lên cơ thể ẩm, xoa nhẹ nhàng theo chuyển động tròn tại các vùng da sần sùi rồi xả sạch.",
    "tags": [
      "bodywash",
      "exfoliating"
    ],
    "variants": [
      {
        "name": "500ml",
        "price": 1050000,
        "salePrice": 950000,
        "stock": 35
      }
    ],
    "soldCount": 215
  },
  {
    "categoryKey": "body",
    "name": "Black Yuzu Conditioning Handwash",
    "shortDescription": "Nước rửa tay tinh dầu quýt Yuzu đen Nhật Bản. Dưỡng ẩm mềm mại, kháng khuẩn và hương thơm sảng khoái.",
    "description": "Được thiết kế cho những đôi bàn tay thường xuyên phải tiếp xúc với chất tẩy rửa hoặc thời tiết hanh khô. Tinh chất Yuzu cô đặc hòa quyện cùng cam bergamot tạo cảm giác tươi mới tức thì, đồng thời để lại lớp màng dưỡng ẩm tự nhiên không nhờn dính.",
    "images": [
      "https://www.morrismotley.com/cdn/shop/products/BLACKYUZUHANDWASHBOTTLEFRONTcopyupdate-990973.png?v=1698442613",
      "https://www.morrismotley.com/cdn/shop/files/CMS_BLKYUZU_CONDITIONING_HANDWASH_SLEEVE_SLIM_500ML_12_5copy_587866d2-c627-49f1-b1c0-bcd8b74819f4.jpg?v=1719548808"
    ],
    "hairType": [
      "mọi loại da"
    ],
    "holdLevel": "low",
    "finish": "natural",
    "ingredients": "Aqua, Citrus Junos (Yuzu) Peel Extract, Citrus Aurantium Bergamia Fruit Oil, Cocamidopropyl Hydroxysultaine, Sodium Hyaluronate, Phenoxyethanol.",
    "howToUse": "Nhấn 1 pump lên tay ướt, xoa kỹ các ngón tay và lòng bàn tay trong 20-30 giây rồi rửa lại bằng nước sạch.",
    "tags": [
      "handwash",
      "yuzu"
    ],
    "variants": [
      {
        "name": "500ml",
        "price": 890000,
        "salePrice": 0,
        "stock": 45
      }
    ],
    "soldCount": 164
  },
  {
    "categoryKey": "body",
    "name": "Black Yuzu Bodywash",
    "shortDescription": "Sữa tắm thanh lọc hương quả Yuzu đen và trà xanh. Đánh thức giác quan mỗi sáng với sự tươi mát sảng khoái.",
    "description": "Phiên bản sữa tắm toàn thân của dòng Black Yuzu danh tiếng. Mang nguồn năng lượng bừng sáng với hương thơm cam chanh tươi mát hòa cùng hậu vị cay ấm của tiêu hồng, giúp loại bỏ mệt mỏi và khởi động ngày mới tràn đầy sinh lực.",
    "images": [
      "https://www.morrismotley.com/cdn/shop/products/BLACKYUZUHANDWASHBOTTLEFRONTupdateBLACK-858660.png?v=1698442613",
      "https://www.morrismotley.com/cdn/shop/files/IMG_2035.jpg?v=1698378973"
    ],
    "hairType": [
      "mọi loại da"
    ],
    "holdLevel": "low",
    "finish": "natural",
    "ingredients": "Aqua, Sodium Laureth-6 Carboxylate, Citrus Junos Peel Oil, Schinus Terebinthifolia Seed Extract, Camellia Sinensis Leaf Extract, Citric Acid.",
    "howToUse": "Tắm dưới vòi sen, xoa đều bọt khắp cơ thể và cảm nhận làn hương cam quýt tinh khôi lan toả trong phòng tắm.",
    "tags": [
      "bodywash",
      "yuzu"
    ],
    "variants": [
      {
        "name": "500ml",
        "price": 980000,
        "salePrice": 890000,
        "stock": 48
      }
    ],
    "soldCount": 231
  },
  {
    "categoryKey": "body",
    "name": "Papyrus Conditioning Handwash",
    "shortDescription": "Nước rửa tay cao cấp hương giấy cói Papyrus và cỏ Vetiver. Sang trọng, trầm ấm và nuôi dưỡng bàn tay.",
    "description": "Lấy cảm hứng từ những cuộn giấy cói cổ đại bên dòng sông Nile, Papyrus Conditioning Handwash là biểu tượng của sự thanh lịch nơi bồn rửa. Hương thơm gỗ thơm cổ điển kết hợp tinh dầu dừa phân đoạn dưỡng ẩm sâu, chăm sóc đôi bàn tay luôn mềm mại.",
    "images": [
      "https://www.morrismotley.com/cdn/shop/files/HANDWASHBOTTLEFRONT.png?v=1698363814",
      "https://www.morrismotley.com/cdn/shop/files/CONDITIONING_HANDWASH_PAP_SLEEVE_SLIM_500ML_12_5copy.jpg?v=1700026453"
    ],
    "hairType": [
      "mọi loại da"
    ],
    "holdLevel": "low",
    "finish": "natural",
    "ingredients": "Aqua, Cyperus Papyrus Root Extract, Vetiveria Zizanoides Root Oil, Caprylic/Capric Triglyceride, Lauryl Glucoside, Lactic Acid.",
    "howToUse": "Xoa 1 lượng nhỏ lên bàn tay ẩm, rửa sạch và lau khô bằng khăn mềm.",
    "tags": [
      "handwash",
      "papyrus"
    ],
    "variants": [
      {
        "name": "500ml",
        "price": 890000,
        "salePrice": 0,
        "stock": 38
      }
    ],
    "soldCount": 142
  },
  {
    "categoryKey": "body",
    "name": "Concrete Rose Granule Handwash",
    "shortDescription": "Nước rửa tay tẩy tế bào chết hương hoa hồng đá Concrete Rose. Vừa làm sạch sâu vừa tỏa hương đài các.",
    "description": "Sự kết hợp táo bạo giữa vẻ gai góc của đá khối và nét kiêu kỳ của cánh hoa hồng damask. Các hạt vi khoáng mềm mịn nhẹ nhàng cuốn trôi bụi bẩn cứng đầu, để lại làn da tay mềm mại bất ngờ cùng làn hương hoa hồng khói say đắm.",
    "images": [
      "https://www.morrismotley.com/cdn/shop/files/HANDWASHBOTTLEFRONT.png?v=1698363814",
      "https://www.morrismotley.com/cdn/shop/files/HANDWASH.jpg?v=1721262441"
    ],
    "hairType": [
      "mọi loại da"
    ],
    "holdLevel": "low",
    "finish": "natural",
    "ingredients": "Aqua, Rosa Damascena Flower Extract, Fine Pumice Granules, Olea Europaea (Olive) Fruit Oil, Glycerin, Parfum.",
    "howToUse": "Massage nhẹ nhàng lên tay trong 30 giây để các hạt khoáng tẩy sạch cặn bẩn rồi xả lại bằng nước.",
    "tags": [
      "handwash",
      "rose"
    ],
    "variants": [
      {
        "name": "500ml",
        "price": 950000,
        "salePrice": 850000,
        "stock": 30
      }
    ],
    "soldCount": 128
  },
  {
    "categoryKey": "body",
    "name": "Zero Zero Hashish Handwash",
    "shortDescription": "Nước rửa tay hương cỏ khô và khói trầm đặc trưng. Bí ẩn, lôi cuốn và nâng niu đôi bàn tay quý ông.",
    "description": "Một tác phẩm nghệ thuật mùi hương phá cách dành cho không gian sống hiện đại. Sự pha trộn độc đáo giữa nốt hương khói resin ấm áp, lá xanh hoang dại và rễ cây thảo mộc, mang lại phong vị trầm tĩnh, đẳng cấp.",
    "images": [
      "https://www.morrismotley.com/cdn/shop/files/HANDWASHBOTTLEFRONT.png?v=1698363814",
      "https://www.morrismotley.com/cdn/shop/files/zerozerorefillcopy_1.jpg?v=1724482929"
    ],
    "hairType": [
      "mọi loại da"
    ],
    "holdLevel": "low",
    "finish": "natural",
    "ingredients": "Aqua, Cannabis Sativa Seed Oil, Olibanum Resin Extract, Pogostemon Cablin Oil, Disodium Cocoamphodiacetate, Tocopherol.",
    "howToUse": "Dùng rửa tay hàng ngày bất cứ khi nào cần làm sạch và tái tạo cảm xúc.",
    "tags": [
      "handwash",
      "hashish"
    ],
    "variants": [
      {
        "name": "500ml",
        "price": 950000,
        "salePrice": 0,
        "stock": 32
      }
    ],
    "soldCount": 115
  },
  {
    "categoryKey": "perfume",
    "name": "Mineralism - Extrait De Parfum (50ml)",
    "shortDescription": "Nước hoa da thuộc khoáng chất cao cấp. Nốt hương cá tính, khác biệt và gây nghiện mạnh mẽ.",
    "description": "\"A work around an aromatic leather with a forbidden side that is realised by a cocaine accord. The scent is unusual. I wanted an addictive note.\" - Morris Motley. Mineralism mở ra với hơi lạnh của đá khoáng và muối biển, trước khi chuyển mình thành tầng da thuộc cao cấp đẫm hương khói và nhựa thơm benzoin bí ẩn.",
    "images": [
      "https://cdn.shopify.com/s/files/1/0384/1238/6443/files/ISP250410_MM_Fragrance_50ml_Mineralism.png?v=1745807602",
      "https://cdn.shopify.com/s/files/1/0384/1238/6443/files/ISP250410_MM_Mineralism_Box_34.png?v=1745807618",
      "https://cdn.shopify.com/s/files/1/0384/1238/6443/files/MINERALISM_BOTTLE_ANNIKA_WEB.jpg?v=1748240213"
    ],
    "hairType": [
      "mọi loại phong cách"
    ],
    "holdLevel": "extreme",
    "finish": "natural",
    "ingredients": "Alcohol Denat., Parfum (Fragrance), Aqua, Leather Accord, Mineral Saline Accord, Styrax, Benzyl Benzoate, Limonene, Linalool.",
    "howToUse": "Xịt trực tiếp 2-3 shot lên các điểm mạch trên cơ thể: cổ tay, hai bên mang tai, gáy hoặc trước ngực. Nồng độ Extrait De Parfum lưu hương trên 12 giờ.",
    "tags": [
      "perfume",
      "bestseller",
      "extrait"
    ],
    "variants": [
      {
        "name": "50ml",
        "price": 3250000,
        "salePrice": 2990000,
        "stock": 20
      }
    ],
    "soldCount": 188
  },
  {
    "categoryKey": "perfume",
    "name": "Fumo Bacco - Extrait De Parfum (50ml)",
    "shortDescription": "Tuyệt tác thuốc lá lá khô, mật ong rừng và gỗ guaiac hun khói. Trầm mặc, ấm áp và vương giả.",
    "description": "Fumo Bacco là bức chân dung của một quý ông bên lò sưởi đêm mùa đông. Những lá thuốc lá hảo hạng lên men ủ cùng mật ong vàng sánh và rượu bourbon lâu năm, tạo nên mùi hương nồng nàn, sang trọng và đầy uy quyền.",
    "images": [
      "https://cdn.shopify.com/s/files/1/0384/1238/6443/files/ISP250410_MM_Fragrance_50ml_FumoBacco.png?v=1745807566",
      "https://cdn.shopify.com/s/files/1/0384/1238/6443/files/ISP250410_MM_FumoBacco_Box_34.png?v=1745807566",
      "https://cdn.shopify.com/s/files/1/0384/1238/6443/files/FUMO_BACCO_BOTTLE_ANNIKA_WEB.jpg?v=1748240254"
    ],
    "hairType": [
      "mọi loại phong cách"
    ],
    "holdLevel": "extreme",
    "finish": "natural",
    "ingredients": "Alcohol Denat., Parfum, Tobacco Leaf Absolute, Honey Extract, Guaiac Wood Oil, Tonka Bean, Coumarin, Eugenol.",
    "howToUse": "Xịt lên các điểm ấm trên da hoặc vạt áo khoác dạ. Thích hợp cho các buổi tối tiệc tùng hoặc tiết trời se lạnh.",
    "tags": [
      "perfume",
      "tobacco",
      "extrait"
    ],
    "variants": [
      {
        "name": "50ml",
        "price": 3250000,
        "salePrice": 0,
        "stock": 25
      }
    ],
    "soldCount": 156
  },
  {
    "categoryKey": "perfume",
    "name": "Fer De Lance - Extrait De Parfum (50ml)",
    "shortDescription": "Nốt hương xanh thảo mộc hoang dã đan xen da thuộc bóng bẩy. Táo bạo, sắc sảo và nguy hiểm.",
    "description": "Lấy tên từ loài rắn độc huyền thoại của rừng nhiệt đới, Fer De Lance mang năng lượng sắc lạnh và dứt khoát. Khởi đầu với quả bách xù mọng nước và ngải tây cay xé, lắng đọng lại trên nền da lộn đen và rêu sồi ẩm ướt.",
    "images": [
      "https://cdn.shopify.com/s/files/1/0384/1238/6443/files/ISP250410_MM_Fragrance_50ml_Fer_De_Lance.png?v=1745807489",
      "https://cdn.shopify.com/s/files/1/0384/1238/6443/files/ISP250410_MM_Fer_De_Lance_Box_34.png?v=1745807531",
      "https://cdn.shopify.com/s/files/1/0384/1238/6443/files/FER_DE_LANCE_BOTTLE_ANNIKA_WEB.jpg?v=1748240079"
    ],
    "hairType": [
      "mọi loại phong cách"
    ],
    "holdLevel": "extreme",
    "finish": "natural",
    "ingredients": "Alcohol Denat., Parfum, Juniper Berry Oil, Artemisia Extract, Suede Accord, Oakmoss Absolute, Evernia Prunastri.",
    "howToUse": "Xịt 2 shot lên vùng cổ hoặc cổ tay để toát lên phong thái đĩnh đạc và quyết đoán.",
    "tags": [
      "perfume",
      "leather",
      "extrait"
    ],
    "variants": [
      {
        "name": "50ml",
        "price": 3250000,
        "salePrice": 0,
        "stock": 18
      }
    ],
    "soldCount": 95
  },
  {
    "categoryKey": "perfume",
    "name": "Oud 777 - Extrait De Parfum (50ml)",
    "shortDescription": "Trầm hương Hoàng gia kết hợp hổ phách sa mạc và nghệ tây quý hiếm. Huyền bí, vương giả và quyến rũ.",
    "description": "Một tác phẩm trầm hương phương Đông xa xỉ. Gỗ trầm tự nhiên nguyên chất được chưng cất cùng cánh hoa hồng Thổ Nhĩ Kỳ và hổ phách xám, mang lại chiều sâu huyền hoặc không thể nhầm lẫn cho người sử dụng.",
    "images": [
      "https://cdn.shopify.com/s/files/1/0384/1238/6443/files/ISP250410_MM_Fragrance_50ml_OUD_777.png?v=1745805599",
      "https://cdn.shopify.com/s/files/1/0384/1238/6443/files/ISP250410_MM_UUD_777_Box_34.png?v=1745805600",
      "https://cdn.shopify.com/s/files/1/0384/1238/6443/files/OUD_777_BOTTLE_ANNIKA_WEB.jpg?v=1748240032"
    ],
    "hairType": [
      "mọi loại phong cách"
    ],
    "holdLevel": "extreme",
    "finish": "natural",
    "ingredients": "Alcohol Denat., Parfum, Aquilaria Agallocha (Oud) Oil, Saffron Extract, Ambergris Accord, Damask Rose Oil, Farnesol.",
    "howToUse": "Dành cho những dịp đặc biệt. Xịt nhẹ vào các điểm mạch để lưu giữ hương thơm hoàng gia cả ngày đêm.",
    "tags": [
      "perfume",
      "oud",
      "extrait"
    ],
    "variants": [
      {
        "name": "50ml",
        "price": 3250000,
        "salePrice": 2990000,
        "stock": 15
      }
    ],
    "soldCount": 147
  },
  {
    "categoryKey": "combo",
    "name": "Hair & Body Complete Luxury Set",
    "shortDescription": "Bộ sưu tập trải nghiệm toàn diện: 1 Matte Styling Balm, 1 Conditioning Shampoo và 1 Bodywash 500ml.",
    "description": "Món quà hoàn hảo để chăm sóc bản thân hoặc dành tặng cho người quan trọng. Bộ sản phẩm gồm 3 bước chăm sóc trọn vẹn: Làm sạch sâu với dầu gội dưỡng ẩm, hồi sinh làn da với sữa tắm cao cấp và tạo kiểu đỉnh cao cùng hũ sáp Matte Balm nổi tiếng. Đóng hộp quà cao cấp chuẩn phong cách Melbourne.",
    "images": [
      "https://www.morrismotley.com/cdn/shop/files/REFILL_SACHETS.jpg?v=1721262825",
      "https://www.morrismotley.com/cdn/shop/files/MatteStylingBalmjarlargersize.png?v=1698363780",
      "https://www.morrismotley.com/cdn/shop/files/CCSBOTTLEFRONT.png?v=1698363719"
    ],
    "hairType": [
      "mọi loại tóc"
    ],
    "holdLevel": "high",
    "finish": "matte",
    "ingredients": "Bao gồm trọn bộ thành phần tự nhiên của dòng sản phẩm chăm sóc tóc và cơ thể Morris Motley.",
    "howToUse": "Sử dụng hàng ngày theo chu trình: Tắm gội làm sạch -> Lau khô tóc -> Vuốt sáp định hình phong thái.",
    "tags": [
      "combo",
      "gift",
      "bestseller"
    ],
    "variants": [
      {
        "name": "Full Box Gift Set",
        "price": 2650000,
        "salePrice": 2290000,
        "stock": 25
      }
    ],
    "soldCount": 172
  }
];

export const banners = [
  {
    "type": "hero_video",
    "eyebrow": "Morris Motley Melbourne",
    "title": "Kết cấu làm nên phong thái",
    "subtitle": "Bộ sưu tập sáp vuốt tóc, chăm sóc cơ thể và nước hoa cao cấp phối chế thủ công tại Melbourne. Tinh tế, khác biệt và thuần dưỡng chất.",
    "ctaLabel": "Khám phá bộ sưu tập",
    "mediaUrl": "https://cdn.shopify.com/videos/c/o/v/23c258df6e99455b8db22a00a7f193d1.mp4",
    "posterUrl": "https://www.morrismotley.com/cdn/shop/files/yuzu_face_for_header_copy_2048x2048.jpg?v=1691459271",
    "linkUrl": "/shop",
    "position": 1
  },
  {
    "type": "collection_banner",
    "title": "Tạo kiểu tóc",
    "subtitle": "Kết cấu hoàn hảo, nuôi dưỡng tóc",
    "mediaUrl": "https://www.morrismotley.com/cdn/shop/files/HAIR_STYLING.jpg?v=1721262850&width=1600",
    "linkUrl": "/shop?category=sap-vuot-toc",
    "position": 1
  },
  {
    "type": "collection_banner",
    "title": "Dầu gội & Dưỡng tóc",
    "subtitle": "Làm sạch sâu và cân bằng da đầu",
    "mediaUrl": "https://www.morrismotley.com/cdn/shop/files/HAIR_CLEANSING.jpg?v=1721262806&width=1600",
    "linkUrl": "/shop?category=dau-goi-duong-toc",
    "position": 2
  },
  {
    "type": "collection_banner",
    "title": "Chăm sóc cơ thể",
    "subtitle": "Thư giãn giác quan với chiết xuất tự nhiên",
    "mediaUrl": "https://www.morrismotley.com/cdn/shop/files/BODYWASH.jpg?v=1721262475&width=1600",
    "linkUrl": "/shop?category=cham-soc-co-the",
    "position": 3
  },
  {
    "type": "collection_banner",
    "title": "Nước hoa cao cấp",
    "subtitle": "Extrait De Parfum nốt hương độc bản",
    "mediaUrl": "https://www.morrismotley.com/cdn/shop/files/EXTRAIT_DE_PARFUM.jpg?v=1721262511&width=1600",
    "linkUrl": "/shop?category=nuoc-hoa-cao-cap",
    "position": 4
  },
  {
    "type": "story",
    "eyebrow": "Triết lý thương hiệu",
    "title": "Nghệ thuật phối chế từ Melbourne",
    "subtitle": "Mỗi công thức là một tác phẩm được nghiên cứu tỉ mỉ bởi thợ tạo mẫu tóc và chuyên gia điều hương danh tiếng Rob Mason, loại bỏ hoàn toàn hoá chất độc hại để giữ gìn mái tóc và làn da khoẻ mạnh.",
    "ctaLabel": "Tìm hiểu câu chuyện",
    "mediaUrl": "https://www.morrismotley.com/cdn/shop/files/M_logo_sketch_for_footer_2048x2048.jpg?v=1721262871",
    "linkUrl": "/about",
    "position": 1
  },
  {
    "type": "promo",
    "eyebrow": "Đặc quyền mua sắm",
    "title": "Miễn phí vận chuyển cho đơn từ 500.000đ",
    "subtitle": "Đóng gói tiêu chuẩn quà tặng sang trọng, giao hàng tận nơi trên toàn quốc.",
    "mediaUrl": "https://www.morrismotley.com/cdn/shop/files/REFILL_SACHETS.jpg?v=1721262825&width=1600",
    "linkUrl": "/shop",
    "position": 1
  }
];

export const coupons = [
  {
    "code": "MORRIS10",
    "description": "Giảm 10% cho đơn từ 500.000đ, tối đa 200.000đ",
    "type": "percent",
    "value": 10,
    "minOrderValue": 500000,
    "maxDiscount": 200000,
    "usageLimit": 500,
    "perUserLimit": 2,
    "expiresAt": "2026-12-07T03:36:59.013Z"
  },
  {
    "code": "FREESHIP50",
    "description": "Giảm 50.000đ phí vận chuyển cho đơn từ 350.000đ",
    "type": "fixed",
    "value": 50000,
    "minOrderValue": 350000,
    "usageLimit": 0,
    "perUserLimit": 3,
    "expiresAt": "2026-11-07T03:36:59.013Z"
  },
  {
    "code": "NEWMORRIS",
    "description": "Giảm 15% cho khách hàng mới, tối đa 300.000đ",
    "type": "percent",
    "value": 15,
    "minOrderValue": 500000,
    "maxDiscount": 300000,
    "usageLimit": 200,
    "perUserLimit": 1,
    "expiresAt": "2027-03-07T03:36:59.013Z"
  }
];

export const users = [
  {
    "name": "Morris Admin",
    "email": "admin@morrisshop.vn",
    "password": "admin123",
    "phone": "0901234567",
    "role": "admin",
    "isVerified": true
  },
  {
    "name": "Nhân viên kho",
    "email": "staff@morrisshop.vn",
    "password": "staff123",
    "phone": "0901234568",
    "role": "staff",
    "isVerified": true
  },
  {
    "name": "Nguyễn Văn Khách",
    "email": "customer@morrisshop.vn",
    "password": "customer123",
    "phone": "0912345678",
    "role": "customer",
    "isVerified": true,
    "addresses": [
      {
        "fullName": "Nguyễn Văn Khách",
        "phone": "0912345678",
        "province": "Hà Nội",
        "district": "Cầu Giấy",
        "ward": "Dịch Vọng Hậu",
        "street": "Số 12, ngõ 5 Trần Thái Tông",
        "isDefault": true
      }
    ]
  }
];

export const sampleReviews = [
  {
    "rating": 5,
    "comment": "Chất sáp Matte Styling Balm đỉnh thật sự, vuốt lên tóc mờ tự nhiên mà giữ nếp cả ngày, không hề bóng hay bết dầu."
  },
  {
    "rating": 5,
    "comment": "Dầu gội Conditioning Crème Shampoo mùi hương thảo mộc rất thư giãn, gội xong da đầu nhẹ tênh mà tóc vẫn mượt."
  },
  {
    "rating": 5,
    "comment": "Mineralism Extrait De Parfum mùi da thuộc khoáng chất cực kỳ khác biệt và độc bản. Xịt từ sáng tới tối vẫn thơm."
  },
  {
    "rating": 5,
    "comment": "Đúng chuẩn Morris Motley Melbourne. Bao bì tối giản cao cấp, chất lượng sản phẩm xứng đáng từng đồng."
  },
  {
    "rating": 4,
    "comment": "Giao hàng nhanh, đóng gói chỉn chu như hộp quà. Dùng Crème Masque làm pre-styler tạo phom rất êm."
  }
];
