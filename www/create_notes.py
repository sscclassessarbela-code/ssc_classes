from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase.pdfmetrics import stringWidth
import os

OUT = r"C:\Users\it care saharsa\Documents\Codex\2026-09-21\chapter-class-10th-ka-ek-shot\outputs\rasayanik_abhikriyaon_evum_samikaran_class_10_bihar_board.pdf"
LOGO = r"C:\Users\it care saharsa\OneDrive\Desktop\SSC_CLASSES_WHITE_SCREEN_FIXED_V2\logo.png"
FONT = r"C:\Windows\Fonts\Nirmala.ttf"
BOLD = r"C:\Windows\Fonts\NirmalaB.ttf"
pdfmetrics.registerFont(TTFont('Hindi', FONT))
pdfmetrics.registerFont(TTFont('HindiBold', BOLD if os.path.exists(BOLD) else FONT))

W,H=A4
NAVY=HexColor('#153A5B'); BLUE=HexColor('#1F77B4'); CYAN=HexColor('#DDF3FF')
ORANGE=HexColor('#FF9F1C'); RED=HexColor('#E74C3C'); GREEN=HexColor('#21A366')
DARK=HexColor('#263238'); GRAY=HexColor('#5D6D7E'); LIGHT=HexColor('#F7FBFD')

def t(c, text, x, y, size=10, font='Hindi', color=DARK, align='left'):
    c.setFont(font,size); c.setFillColor(color)
    if align=='center': x -= stringWidth(text,font,size)/2
    elif align=='right': x -= stringWidth(text,font,size)
    c.drawString(x,y,text)

def line(c,x1,y1,x2,y2,color=BLUE,w=1):
    c.setStrokeColor(color);c.setLineWidth(w);c.line(x1,y1,x2,y2)

def header(c,page):
    c.setFillColor(NAVY); c.rect(0,H-86,W,86,fill=1,stroke=0)
    c.drawImage(ImageReader(LOGO), 35,H-78,60,60,mask='auto',preserveAspectRatio=True,anchor='c')
    t(c,'S.S.C. CLASSES',W/2,H-39,23,'HindiBold',white,'center')
    t(c,'by Sonu Sir',W/2,H-61,12,'Hindi',HexColor('#BCE8FF'),'center')
    c.setFillColor(ORANGE); c.rect(0,H-90,W,4,fill=1,stroke=0)
    t(c, 'कक्षा 10 | बिहार बोर्ड | एक-शॉट नोट्स', W-34,H-77,8,'Hindi',white,'right')
    t(c,f'{page}/2',W-34,18,8,'Hindi',GRAY,'right')

def box(c,x,y,w,h,title,color=BLUE):
    c.setFillColor(white);c.setStrokeColor(HexColor('#C9DEE9'));c.setLineWidth(.7)
    c.roundRect(x,y,w,h,8,fill=1,stroke=1)
    c.setFillColor(color);c.roundRect(x,y+h-24,w,24,8,fill=1,stroke=0)
    c.rect(x,y+h-24,w,8,fill=1,stroke=0)
    t(c,title,x+10,y+h-17,11,'HindiBold',white)

def atom(c,x,y,r,color,label):
    # 3D sphere: outer shadow, main disk, highlight
    c.setFillColor(HexColor('#B9C4CD'));c.circle(x+3,y-4,r,fill=1,stroke=0)
    c.setFillColor(color);c.circle(x,y,r,fill=1,stroke=0)
    c.setFillColor(HexColor('#FFFFFF'));c.setFillAlpha(.55);c.circle(x-r*.28,y+r*.32,r*.32,fill=1,stroke=0);c.setFillAlpha(1)
    t(c,label,x,y-4,10,'HindiBold',DARK,'center')

def arrow(c,x1,y,x2,label='',color=ORANGE):
    line(c,x1,y,x2-7,y,color,2);c.setFillColor(color);c.setStrokeColor(color)
    c.line(x2-9,y+4,x2,y);c.line(x2-9,y-4,x2,y)
    if label:t(c,label,(x1+x2)/2,y+8,7,'HindiBold',color,'center')

c=canvas.Canvas(OUT,pagesize=A4)
c.setTitle('रासायनिक अभिक्रियाएँ एवं समीकरण - कक्षा 10')

# page 1
header(c,1)
t(c,'रासायनिक अभिक्रियाएँ एवं समीकरण',W/2,H-116,20,'HindiBold',NAVY,'center')
t(c,'बोर्ड परीक्षा के लिए सबसे जरूरी परिभाषाएँ, संकेत और समीकरण',W/2,H-133,9,'Hindi',GRAY,'center')

box(c,30,603,535,88,'1. रासायनिक अभिक्रिया क्या है?',BLUE)
t(c,'जब एक या अधिक पदार्थ बदलकर नए गुणों वाले पदार्थ बनाते हैं, उसे रासायनिक अभिक्रिया कहते हैं।',42,651,10)
t(c,'पहचान: रंग/ताप में परिवर्तन, गैस निकलना, अवक्षेप बनना या प्रकाश उत्पन्न होना।',42,632,10)
t(c,'उदाहरण: मैग्नीशियम + ऑक्सीजन → मैग्नीशियम ऑक्साइड',42,613,10,'HindiBold',RED)

box(c,30,434,535,150,'2. समीकरण लिखने के स्वर्ण नियम',GREEN)
t(c,'• शब्द समीकरण:  अभिकारक → उत्पाद',43,548,10)
t(c,'• रासायनिक समीकरण में प्रतीक/सूत्र लिखें:  Mg + O₂ → MgO',43,526,10)
t(c,'• संतुलित समीकरण में दोनों ओर हर तत्व के परमाणु बराबर होते हैं।',43,504,10)
t(c,'• गुणांक बदलें, सूत्र के नीचे लिखी संख्या (subscript) कभी नहीं।',43,482,10,'HindiBold',RED)
t(c,'• अवस्थाएँ: (s) ठोस, (l) द्रव, (g) गैस, (aq) जलीय;  Δ = गर्म करना',43,460,9)

# 3d balancing diagram
box(c,30,258,535,151,'3D चित्र: Mg के जलने पर संतुलन समझें',ORANGE)
atom(c,91,342,23,HexColor('#A8D8EA'),'Mg'); atom(c,145,342,20,HexColor('#F8C471'),'O')
arrow(c,181,342,287,'जलाना')
atom(c,330,342,21,HexColor('#A8D8EA'),'Mg'); atom(c,381,342,18,HexColor('#F8C471'),'O')
t(c,'Mg + O₂ → MgO  (असंतुलित)',W/2,301,10,'HindiBold',RED,'center')
t(c,'2Mg + O₂ → 2MgO  (संतुलित)',W/2,280,12,'HindiBold',GREEN,'center')
t(c,'याद रखें: बाईं ओर Mg = 2 और O = 2; दाईं ओर भी Mg = 2 और O = 2।',W/2,263,9,'Hindi',DARK,'center')

box(c,30,55,535,172,'4. परीक्षा में पूछे जाने वाले मुख्य प्रकार',NAVY)
items=[
('संयोजन','दो/अधिक पदार्थ मिलकर एक उत्पाद:  CaO + H₂O → Ca(OH)₂'),
('विघटन','एक पदार्थ टूटे:  CaCO₃  Δ→  CaO + CO₂'),
('विस्थापन','अधिक क्रियाशील धातु दूसरी को हटाए:  Zn + CuSO₄ → ZnSO₄ + Cu'),
('द्विविस्थापन','आयनों की अदला-बदली:  Na₂SO₄ + BaCl₂ → BaSO₄↓ + 2NaCl'),
]
yy=185
for a,b in items:
    t(c,'• '+a+': ',43,yy,9,'HindiBold',BLUE); t(c,b,120,yy,8.6);yy-=31

c.showPage()

# page 2
header(c,2)
t(c,'महत्वपूर्ण अभिक्रियाएँ - झटपट दोहराव',W/2,H-116,19,'HindiBold',NAVY,'center')

box(c,30,592,260,133,'ऊष्माक्षेपी व ऊष्माशोषी',RED)
t(c,'ऊष्माक्षेपी: ऊष्मा बाहर निकलती है।',42,680,9.5,'HindiBold',DARK)
t(c,'CH₄ + 2O₂ → CO₂ + 2H₂O + ऊष्मा',42,659,8.6,'Hindi',RED)
t(c,'ऊष्माशोषी: ऊष्मा ली जाती है।',42,631,9.5,'HindiBold',DARK)
t(c,'CaCO₃  Δ→  CaO + CO₂',42,610,9,'Hindi',BLUE)

box(c,305,592,260,133,'ऑक्सीकरण - अपचयन',GREEN)
t(c,'ऑक्सीकरण: ऑक्सीजन जुड़ना / H हटना',317,680,9.2,'HindiBold')
t(c,'अपचयन: ऑक्सीजन हटना / H जुड़ना',317,656,9.2,'HindiBold')
t(c,'CuO + H₂ → Cu + H₂O',317,630,11,'HindiBold',NAVY)
t(c,'CuO का अपचयन; H₂ का ऑक्सीकरण',317,608,8.5,'Hindi',RED)

# corrosion diagram
box(c,30,370,535,190,'3D चित्र: लोहे में जंग कैसे लगती है?',ORANGE)
t(c,'लोहा + ऑक्सीजन + जल → जंग (Fe₂O₃·xH₂O)',W/2,524,11,'HindiBold',RED,'center')
# iron bar perspective
c.setFillColor(HexColor('#6D7B8D'));c.setStrokeColor(HexColor('#43505D'));c.setLineWidth(1)
c.rect(80,425,145,43,fill=1,stroke=1);c.setFillColor(HexColor('#8D99A5'));c.rect(92,435,121,23,fill=1,stroke=0)
# water droplets / oxygen
atom(c,298,469,18,HexColor('#A8D8EA'),'H₂O');atom(c,357,469,18,HexColor('#F8C471'),'O₂')
arrow(c,278,444,237,'नमी + हवा',BLUE)
c.setFillColor(HexColor('#A64B2A'));c.circle(125,446,8,fill=1,stroke=0);c.circle(159,452,7,fill=1,stroke=0);c.circle(189,443,9,fill=1,stroke=0)
t(c,'जंग से बचाव: पेंट, तेल/ग्रीस, गैल्वनीकरण, मिश्रधातु।',W/2,391,9.5,'Hindi',DARK,'center')

box(c,30,175,535,171,'अति महत्वपूर्ण प्रश्नोत्तर',BLUE)
qa=[
('Q1. श्वसन किस प्रकार की अभिक्रिया है?','A. ऊष्माक्षेपी; ग्लूकोज के ऑक्सीकरण से ऊर्जा मिलती है।'),
('Q2. अवक्षेप अभिक्रिया का उदाहरण?','A. BaCl₂ + Na₂SO₄ → BaSO₄↓ + 2NaCl'),
('Q3. विकृतगंधिता (Rancidity) क्या है?','A. तेल/वसा का ऑक्सीकरण; बचाव: वायुरुद्ध पैक, एंटीऑक्सीडेंट, फ्रिज।'),
('Q4. प्रकाशीय विघटन का उदाहरण?','A. 2AgCl  सूर्यप्रकाश→  2Ag + Cl₂')]
yy=314
for q,a in qa:
    t(c,q,42,yy,9,'HindiBold',NAVY);t(c,a,42,yy-15,8.6,'Hindi',DARK);yy-=39

c.setFillColor(CYAN);c.roundRect(30,53,535,92,8,fill=1,stroke=0)
t(c,'बोर्ड टिप',46,119,11,'HindiBold',RED)
t(c,'समीकरण लिखते समय: पहले सूत्र सही लिखें → परमाणु गिनें → गुणांक लगाकर संतुलित करें → अवस्था/शर्त जोड़ें।',46,98,9.5,'Hindi',DARK)
t(c,'एक अंक पक्का: परिभाषा + एक संतुलित उदाहरण + अभिक्रिया का प्रकार अवश्य लिखें।',46,75,9.5,'HindiBold',NAVY)

c.save()
print(OUT)
