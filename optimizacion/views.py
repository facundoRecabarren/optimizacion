from django.http import HttpResponse,JsonResponse,HttpRequest
from django.template import Template,Context
import json
import requests
from ortools.linear_solver import pywraplp
from django.template import loader

#DOCUMENTACION
#https://google.github.io/or-tools/python/ortools/linear_solver/pywraplp.html#pywraplp.Solver.IntVar

#VERSIONES USADAS
#Python 3.8.5
#Django 3.1.1
#ortools 7.8.7959

#https://www.dm.uba.ar/materias/investigacion_operativa/2010/2/cap4_05.pdf

#CLASES
class paquete():
    def __init__(self,peso,volumen,id,latitud,longitud,descripcion):
        self.peso = peso
        self.volumen = volumen
        self.id = id
        self.descripcion = descripcion
        self.latitud = latitud
        self.longitud = longitud

class camion():
    def __init__(self,capacidad,num_id,patente):
        self.capacidad = capacidad
        self.peso_kilo = 10
        self.id = num_id
        self.patente = patente

#CODIGO DE LA API
def buscar(request: HttpRequest): 
    created=request.body
    jeyson=json.loads(created)

    lista_camiones=[]
    lista_paquetes=[]
    for kmion in jeyson['trucks']:
        new_camion = camion(kmion['capacidad'],kmion['id'],kmion['patente'])
        lista_camiones.append(new_camion)
    
    for marker in jeyson['markers']:
        for paqte in marker['packages']:
            new_paquete = paquete(int(paqte['weight']),int(paqte['volume']),int(paqte['id']),float(marker['lat']),float(marker['lon']),paqte['description'])
            lista_paquetes.append(new_paquete)

    rango_camion = list(range(len(lista_camiones)))
    rango_paquete = list(range(len(lista_paquetes)))
   
    #CREAMOS EL SOLVER
    solver = pywraplp.Solver.CreateSolver('multiple_knapsack_mip','CBC')
    #DECLARAMOS LAS VARIABLES DEL PROBLEMA
    x={}
    #cantidad de paquetes
    for i in rango_paquete:
        for j in rango_camion:
            x[(i,j)] = solver.IntVar(0,1,'x_%i_%i' %(i,j))
    #como vemos j son los camiones y las i'es son los paquetes, en esta regla lo que especificamos es que 
    #la tupla camion,paquete tendra valor 1 si este se coloca en ese camion, de lo contrario será 0

    #RESTRICCIONES
    #CADA PAQUETE SOLO A 1 CAMION
    for i in rango_paquete:
        solver.Add(sum(x[i,j] for j in rango_camion) <= 1)
    #aqui especificamos que la suma de una fila, es decir, de un paquete y todos los camiones sea 1 (el paquete asignado a 1 solo camion)
    
    #LA CANTIDAD EMPACADA EN CADA CAMION NO PUEDE EXCEDER SU CAPACIDAD
    for j in rango_camion:
        solver.Add(
            sum(x[(i,j)] * lista_paquetes[i].peso
            for i in rango_paquete) <= lista_camiones[j].capacidad
        )
    
    #DEFINIMOS EL OBJETIVO
    objetivo = solver.Objective()
    for i in rango_paquete:
        for j in rango_camion:
            objetivo.SetCoefficient(x[(i,j)], lista_paquetes[i].volumen)
    objetivo.SetMaximization()
    #el objetivo esta definido en base a maximizar el uso de los camiones (el volumen en ellos), es decir, completar el espacio en los camiones para que sean menos los que circulan
    #por ende menos dinero dirigido a camiones

    status = solver.Solve()
    if status == pywraplp.Solver.OPTIMAL:
        #crear un json para devolver
        devolucion = {'Vol_Total_Usado': objetivo.Value()}
        peso_total = 0
        camiones = []
        for j in rango_camion:
            lista_de_camion = {}
            #packages = []

            destinos_dict = {}

            peso_ocupado = 0
            volumen_ocupado = 0
            lista_de_camion['id'] = lista_camiones[j].id
            lista_de_camion['capacidad'] = lista_camiones[j].capacidad
            lista_de_camion['patente'] = lista_camiones[j].patente

            for i in rango_paquete:
                if x[i,j].solution_value() > 0:
                    peso_ocupado += lista_paquetes[i].peso
                    volumen_ocupado += lista_paquetes[i].volumen
                    
                    #lista_paq={'id':lista_paquetes[i].descripcion,'weight':lista_paquetes[i].peso,'volume':lista_paquetes[i].volumen,'lat':lista_paquetes[i].latitud,'lon':lista_paquetes[i].longitud}
                    lista_paq={'id':lista_paquetes[i].id,'weight':lista_paquetes[i].peso,'volume':lista_paquetes[i].volumen, 'description':lista_paquetes[i].descripcion}
                   
                    #packages.append(lista_paq)
                    
                    #por cada paquete creo un destino, si este existe
                    coord = str(lista_paquetes[i].latitud)+'/'+str(lista_paquetes[i].longitud)
                    if not coord in destinos_dict:
                        destinos_dict[coord] = []
                        destinos_dict[coord].append(lista_paq)
                    else:
                        destinos_dict[coord].append(lista_paq)
                    
            #añado lat y longitud como un destino
            destinos = []
            for latlon,packs in destinos_dict.items():
                dest = latlon.split(sep='/')
                latitud = float(dest[0])
                longitud = float(dest[1])
                #armar el arreglo con paquetes
                sub_pack={'lat':latitud,'lon':longitud,'packages':packs}
                destinos.append(sub_pack)
            lista_de_camion['dinero_recaudado']= lista_camiones[j].peso_kilo * peso_ocupado                 
            
            #lista_de_camion['packages'] = packages
            lista_de_camion['destinos'] = destinos
            
            peso_total += peso_ocupado
            camiones.append(lista_de_camion)
        
        #buscamos PAQUETES SIN CAMION ASIGNADO
        #para cada paquete si la suma de su fila, es decir de la asignacion a los camiones, es 0, no fue asignado a ningun camion
        no_empacado = []
        for i in rango_paquete:
            if sum(x[i,j].solution_value() for j in rango_camion) == 0:
                lista_paq={'id':lista_paquetes[i].id,'weight':lista_paquetes[i].peso,'volume':lista_paquetes[i].volumen, 'description':lista_paquetes[i].descripcion,'lat':lista_paquetes[i].latitud,'lon':lista_paquetes[i].longitud}
                no_empacado.append(lista_paq)

        devolucion['peso_total'] = peso_total
        devolucion['camiones'] = camiones

        devolucion['no_empacado'] = no_empacado
        return HttpResponse(json.dumps(devolucion))
    else: 
        return HttpResponse("No hay solucion OPTIMA")


    #request.headers
    #data=request.GET.get('created')
    #jeyson = request.get_component_data({"request": request})
    #data=json.loads(jeyson)
    #data=requests.request.__getattribute__('request')
    

    #if (request.content_type == 'json'):
    #    return HttpResponse("Es un json")
    #else: 
    #    if (request.content_type == 'text/plain'):
    #        return HttpResponse("Es %s ayayay" % request.content_type)
    #    else:
    #        return HttpResponse("El contenido es: %s" %request.content_type)
    
    
    #payload={'pesos':[120,23, 30,203,102],'valores':[10,9,8,2,3] }
    #doc = json.dumps(payload) #de python a json
    #py = json.loads(doc) #de json a python

    #data = request.body.decode('utf-8') 
    #jsonLoads = json.loads(data)
    #return HttpResponse(jsonLoads)
    
    #return HttpResponse(request.raw_get_data)
    
    #response con Json 
    # from django.http import JsonResponse
    # response = JsonResponse({'foo': 'bar'})
    # response.content

    
    #return HttpResponse("De python a Json %s //// De json a Python %s /// Manejo de Payload %s Pos 1" %(doc ,py['pesos'],payload['valores'][1]) )
    #name= request.GET["fname"]
    #lastname= request.GET["lname"]
    #{ 	"created": "2020-06-01T00:00:00.000-0300",     "modified": 
    # "2020-06-02T00:00:00.000-0300",     "name": "cliente2",     "lastname": "cliente2",     "cuit": "23123",     "address": "asdasd", 	"currentaccountID": 1 }


#def buscar(request):
    #path = request.path
    #scheme = request.scheme
    #method = request.method
    #address = request.META['REMOTE_ADDR']
    #user_agent = request.META['HTTP_USER_AGENT']

    #msg = f'''
#<html>
#Path: {path}<br>
#Scheme: {scheme}<br>
#Method: {method}<br>
#Address: {address}<br>
#User agent: {user_agent}<br>
#</html>
#'''    
#    return HttpResponse(msg, content_type='text/html', charset='utf-8')

def saludo(request): #primera vista
    jsonStyle1 = json.dumps(
                {"trucks": [
                    {
                        "id": 1,
                        "name": "mionca",
                        "capacidad": 100,
                        "patente":"asbda"
                    },
                    {
                        "id": 2,
                        "name": "mioncaSCANIA2",
                        "capacidad": 20,
                        "patente":"askkkk"
                    }
                ],
                "markers": [
                    {
                        "id": 1,
                        "lat": 31.3443,
                        "lon": 54.654,
                        "packages": [
                            {
                                "id": 1,
                                "description": "que se yo, este attrib no se si lo vamos a poner",
                                "weight": 20,
                                "volume": 5000
                            },
                            {
                                "id": 2,
                                "description": "que se yo, este attrib no se si lo vamos a poner",
                                "weight": 30,
                                "volume": 6000
                            }
                        ]
                    },
                    {
                        "id": 2,
                        "lat": 36.3443,
                        "lon": 57.654,
                        "packages": [
                            {
                                "id": 9,
                                "description": "que se yo, este attrib no se si lo vamos a poner",
                                "weight": 19,
                                "volume": 900
                            },
                            {
                                "id": 10,
                                "description": "que se yo, este attrib no se si lo vamos a poner",
                                "weight": 10,
                                "volume": 901
                            }
                        ]
                    }
                ]
            },indent=4)
    jsonStyle2 = json.dumps(
        {"Vol_Total_Usado": 12801.0,
                "peso_total": 79,
                "camiones": [
                    {
                        "id": 1,
                        "capacidad": 100,
                        "patente": "asbda",
                        "dinero_recaudado": 790,
                        "destinos": [
                            {
                                "lat": 31.3443,
                                "lon": 54.654,
                                "packages": [
                                    {
                                        "id": 1,
                                        "weight": 20,
                                        "volume": 5000,
                                        "description": "que se yo, este attrib no se si lo vamos a poner"
                                    },
                                    {
                                        "id": 2,
                                        "weight": 30,
                                        "volume": 6000,
                                        "description": "que se yo, este attrib no se si lo vamos a poner"
                                    }
                                ]
                            },
                            {
                                "lat": 36.3443,
                                "lon": 57.654,
                                "packages": [
                                    {
                                        "id": 9,
                                        "weight": 19,
                                        "volume": 900,
                                        "description": "que se yo, este attrib no se si lo vamos a poner"
                                    },
                                    {
                                        "id": 10,
                                        "weight": 10,
                                        "volume": 901,
                                        "description": "que se yo, este attrib no se si lo vamos a poner"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "id": 2,
                        "capacidad": 20,
                        "patente": "askkkk",
                        "dinero_recaudado": 0,
                        "destinos": []
                    }
                ],
                "no_empacado": []
            }, indent=4)

    template = loader.get_template('index.html')

    #al metodo render le pasamos un diccionario con el contexto (datos que se van a colocar en el html)
    context = {"jsonStyle1":jsonStyle1,"jsonStyle2" : jsonStyle2}
    document = template.render(context)
    return HttpResponse(document)