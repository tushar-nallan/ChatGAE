# -*- coding: utf-8 -*-

#########################################################################
## This scaffolding model makes your app work on Google App Engine too
## File is released under public domain and you can use without limitations
#########################################################################

if not request.env.web2py_runtime_gae:     
    ## if NOT running on Google App Engine use SQLite or other DB
    db = DAL('sqlite://storage.sqlite') 
else:
    ## connect to Google BigTable (optional 'google:datastore://namespace')
    db = DAL('google:datastore') 
    ## store sessions and tickets there
    session.connect(request, response, db = db) 
    ## or store session in Memcache, Redis, etc.
    ## from gluon.contrib.memdb import MEMDB
    ## from google.appengine.api.memcache import Client
    ## session.connect(request, response, db = MEMDB(Client()))

## by default give a view/generic.extension to all actions from localhost
## none otherwise. a pattern can be 'controller/function.extension'
response.generic_patterns = ['*'] if request.is_local else []

#########################################################################
## Here is sample code if you need for
## - email capabilities
## - authentication (registration, login, logout, ... )
## - authorization (role based authorization)
## - services (xml, csv, json, xmlrpc, jsonrpc, amf, rss)
## - old style crud actions
## (more options discussed in gluon/tools.py)
#########################################################################

import random,datetime
from gluon.tools import Auth, Crud, Service, PluginManager, prettydate
auth = Auth(db, hmac_key=Auth.get_or_create_key()) 
crud, service, plugins = Crud(db), Service(), PluginManager()

## create all tables needed by auth if not custom tables
auth.settings.extra_fields['auth_user']=[
        Field('status'),
        Field('flag',requires=IS_IN_SET(['Available','Invisible','Busy']),readable=False, writable=False,default='Available'),
        Field('offline','boolean',default=False,readable=False,writable=False),
        Field('friends_ids','list:integer',readable=False,writable=False,default=[]),
        Field('friendReq_ids','list:integer',readable=False,writable=False,default=[]),
        Field('friendPending_ids','list:integer',readable=False,writable=False,default=[]),
        Field('group_ids','list:integer',readable=False,writable=False,default=[]),
        Field('block_ids','list:integer',readable=False,writable=False,default=[]),
        Field('channel_id',default=str(random.randint(1,10000))+str(datetime.datetime.now()),readable=False, writable=False)]

auth.messages.verify_password_comment=''
auth.define_tables() 

## configure email
mail=auth.settings.mailer
mail.settings.server = 'smtp.gmail.com:587'
mail.settings.sender = 'chatgae.appspot@gmail.com'
mail.settings.login = 'chatgae.appspot:adminpass'

## configure auth policy
auth.settings.registration_requires_verification = False
auth.settings.registration_requires_approval = False
auth.settings.reset_password_requires_verification = True

## if you need to use OpenID, Facebook, MySpace, Twitter, Linkedin, etc.
## register with janrain.com, write your domain:api_key in private/janrain.key
from gluon.contrib.login_methods.rpx_account import use_janrain
use_janrain(auth,filename='private/janrain.key')

#########################################################################
## Define your tables below (or better in another model file) for example
##
## >>> db.define_table('mytable',Field('myfield','string'))
##
## Fields can be 'string','text','password','integer','double','boolean'
##       'date','time','datetime','blob','upload', 'reference TABLENAME'
## There is an implicit 'id integer autoincrement' field
## Consult manual for more options, validators, etc.
##
## More API examples for controllers:
##
## >>> db.mytable.insert(myfield='value')
## >>> rows=db(db.mytable.myfield=='value').select(db.mytable.ALL)
## >>> for row in rows: print row.id, row.myfield
#########################################################################

db.define_table('text_replacements',
    Field('word'),
    Field('replace'))

db.define_table('image_replacements',
    Field('word'),
    Field('replace','upload'))#,uploadfield='replace_img'),
    #Field('replace_img','blob'))
    
db.define_table('settings',
    Field('userId',requires=IS_IN_DB(db,'auth_user.id','%(first_name)s'),readable=False,writable=False),
    Field('history','boolean',label='Enable Chat History?',default=True),
    Field('text_replacement_id','list:integer',readable=False,writable=False,default=[]),
    Field('image_replacement_id','list:integer',readable=False,writable=False,default=[]))

db.define_table('groups',
    Field('name'),
    Field('members','list:integer'),
    Field('moderators','list:integer'))

db.define_table('history',
    Field('userIds'),
    Field('chat','text'),
    Field('timeStamp',default=datetime.datetime.now().strftime("%H:%M:%S %h %d %Y")))

db.define_table('message',
    Field('text','text'),
    Field('user',db.auth_user))
