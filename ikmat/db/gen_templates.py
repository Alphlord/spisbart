# Lager 03_templates.sql fra listene under. Kjør: python3 gen_templates.py
import json
rows=[]  # (area_kind, domain, routine, title, hint, kind, unit, min, max, recurrence, requires_alcohol)
def add(area,domain,routine,title,hint=None,kind='check',unit=None,mn=None,mx=None,rec=None,alk=False):
    rows.append((area,domain,routine,title,hint,kind,unit,mn,mx,rec or {"freq":"daily"},alk))
G='Foreslått grense. Juster etter din HACCP-plan.'
# Kjøkken åpning
K='kjokken'
add(K,'mat','apning','Temperatur i kjøl','Mål og skriv inn. '+G,'measure','°C',None,4)
add(K,'mat','apning','Temperatur i frys','Mål og skriv inn. '+G,'measure','°C',None,-18)
# Kjøkken stenging
add(K,'mat','stenging','Rester er nedkjølt, merket og dekket til','Dato, innhold og hvem som lagde det.')
add(K,'mat','stenging','Flater, gulv, utstyr og avtrekk er rengjort','Etter renholdsplanen.')
add(K,'mat','stenging','Frityr og stekebord er rengjort og slått av')
add(K,'mat','stenging','Avfall og matrester er tømt')
add(K,'mat','stenging','Gass, ovner og ventilasjon er slått av')
# Bar
B='bar'
add(B,'mat','apning','Temperatur i kjøl for drikke og melk','Mål og skriv inn. '+G,'measure','°C',None,4)
add(B,'mat','stenging','Ølanlegg skylt og kraner rengjort')
add(B,'mat','stenging','Garnityr og åpnede produkter satt i kjøl, gammelt kastet')
add(B,'mat','stenging','Drensrenner, matter og disker vasket')
add(B,'mat','stenging','Glass og tomgods ryddet og kastet','Knust glass håndteres trygt.')
# Kafé
C='kafe'
add(C,'mat','apning','Temperatur i vitrin og kjøl','Mål og skriv inn. '+G,'measure','°C',None,4)
add(C,'mat','apning','Toalett er rent og har såpe og papir')
add(C,'mat','stenging','Melkesystem og dampstav er rengjort','Etter produsentens anvisning.')
add(C,'mat','stenging','Kaffemaskin, kvern og tilbehør er rengjort')
add(C,'mat','stenging','Flater, gulv og sittegrupper er rengjort')
add(C,'mat','stenging','Toalett kontrollert og rengjort')
add(C,'mat','stenging','Avfall og pant er ute')
# Felles: mat, ukentlig/månedlig
A='alle'
add(A,'mat','ukentlig','Kontroller kalibrering av termometer','Test mot isvann (0 °C).',rec={"freq":"monthly","every":6,"day":1})
add(A,'mat','ukentlig','Gjennomgå utgåtte varer i lager',rec={"freq":"weekly","weekdays":[5]})
add(A,'mat','manedlig','Grundig rengjøring etter renholdsplan','Avtrekk, kjølerom, bak og under utstyr.',rec={"freq":"monthly","day":1})
add(A,'mat','manedlig','Gjennomgå avvik siste måned','Se om noe gjentar seg.',rec={"freq":"monthly","day":1})
add(A,'mat','arlig','Årlig gjennomgang av IK-mat og HACCP-plan','Oppdater ved nye retter, leverandører eller utstyr.',rec={"freq":"yearly","month":1,"day":10})
# Alkohol
add(A,'alkohol','ukentlig','Gjennomgå hendelseslogg for alkohol','Nektet servering, påvirkede gjester, uenigheter.',rec={"freq":"weekly","weekdays":[1]},alk=True)
add(A,'alkohol','manedlig','Gjennomgå opplæring og kursstatus for ansatte',None,alk=True,rec={"freq":"monthly","every":6,"day":1})
add(A,'alkohol','arlig','Årlig gjennomgang av IK-alkohol','Gå gjennom systembeskrivelse, ansvar og rutiner.',rec={"freq":"yearly","month":1,"day":15},alk=True)
# HMS
add(A,'hms','manedlig','Vernerunde','Gå gjennom hver avdeling med sjekkliste.',rec={"freq":"yearly","month":1,"day":5})
add(A,'hms','manedlig','Brannslukkere, nødutganger og brannvarsler kontrollert',rec={"freq":"monthly","every":6,"day":5})
add(A,'hms','manedlig','Gass og elektrisk utstyr kontrollert','Lekkasjer, ledninger og apparater.',rec={"freq":"monthly","every":6,"day":5})
add(A,'hms','manedlig','Førstehjelpsutstyr er komplett','Sjekk utløpsdato.',rec={"freq":"monthly","every":6,"day":5})
add(A,'hms','arlig','Årlig gjennomgang av HMS og risikovurdering','Oppdater tiltaksplan og HMS-mål.',rec={"freq":"yearly","month":1,"day":20})

def q(v):
    if v is None: return 'null'
    if isinstance(v,bool): return 'true' if v else 'false'
    if isinstance(v,(int,float)): return str(v)
    return "'"+str(v).replace("'","''")+"'"
out=["-- Generert av gen_templates.py. Ikke rediger for hånd.",
"insert into public.task_templates (area_kind, domain, routine, title, hint, kind, unit, min_value, max_value, recurrence, sort, requires_alcohol) values"]
vals=[]
for i,(a,d,r,t,h,k,u,mn,mx,rec,alk) in enumerate(rows):
    vals.append("(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s::jsonb,%d,%s)"%(q(a),q(d),q(r),q(t),q(h),q(k),q(u),q(mn),q(mx),q(json.dumps(rec)),i*10,q(alk)))
out.append(",\n".join(vals)+";")
open('03_templates.sql','w',encoding='utf-8').write("\n".join(out)+"\n")
print(len(rows),'maler')
