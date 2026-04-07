from fpdf import FPDF

class PDF(FPDF):
    def header(self):
        self.set_fill_color(0, 231, 255)
        self.rect(0, 0, 210, 25, 'F')
        self.set_font('Helvetica', 'B', 16)
        self.set_text_color(51, 64, 79)
        self.cell(0, 25, 'SeniorAdvisor.cl - Manual de Roles y Permisos', align='C')
        self.ln(30)

    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(150, 150, 150)
        self.cell(0, 10, f'SeniorAdvisor.cl | Pagina {self.page_no()}/{{nb}}', align='C')

    def section_title(self, title, r=51, g=64, b=79):
        self.set_font('Helvetica', 'B', 14)
        self.set_text_color(r, g, b)
        self.cell(0, 10, title, ln=True)
        self.set_draw_color(0, 231, 255)
        self.set_line_width(0.8)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(4)

    def subtitle(self, text):
        self.set_font('Helvetica', 'B', 11)
        self.set_text_color(51, 64, 79)
        self.cell(0, 7, text, ln=True)
        self.ln(1)

    def body_text(self, text):
        self.set_font('Helvetica', '', 10)
        self.set_text_color(80, 80, 80)
        self.multi_cell(0, 5.5, text)
        self.ln(2)

    def bullet(self, text, indent=15):
        x = self.get_x()
        self.set_font('Helvetica', '', 10)
        self.set_text_color(80, 80, 80)
        self.cell(indent, 5.5, '')
        self.set_font('Helvetica', 'B', 10)
        self.set_text_color(0, 231, 255)
        self.cell(5, 5.5, '-')
        self.set_font('Helvetica', '', 10)
        self.set_text_color(80, 80, 80)
        self.multi_cell(0, 5.5, f' {text}')
        self.ln(0.5)

    def plan_table(self):
        self.set_font('Helvetica', 'B', 9)
        col_w = [75, 30, 30, 30]
        headers = ['Funcion', 'Destacado', 'Premium', 'Premium+']
        
        # Header
        self.set_fill_color(51, 64, 79)
        self.set_text_color(255, 255, 255)
        for i, h in enumerate(headers):
            self.cell(col_w[i], 8, h, border=1, align='C', fill=True)
        self.ln()

        rows = [
            ('Galeria de fotos', 'Si', 'Si', 'Si'),
            ('Precios', 'Si', 'Si', 'Si'),
            ('Ubicacion / Direccion', 'Si', 'Si', 'Si'),
            ('Sobre mi / Descripcion', 'Si', 'Si', 'Si'),
            ('Mas info (personal_info)', 'Si', 'Si', 'Si'),
            ('Amenidades / Servicios', 'No', 'Si', 'Si'),
            ('Chat directo (tel/whatsapp)', 'No', 'Si', 'Si'),
            ('Presencia en Destacados', 'No', 'Si', 'Si'),
            ('Sello Verificado', 'No', 'Si', 'Si'),
            ('Solicitudes de clientes', 'No', 'Si', 'Si'),
            ('Video YouTube', 'No', 'No', 'Si'),
            ('Slider Premium (galeria)', 'No', 'No', 'Si'),
            ('Redes Sociales', 'No', 'No', 'Si'),
            ('Corona en badge', 'No', 'No', 'Si'),
        ]

        self.set_font('Helvetica', '', 9)
        for j, row in enumerate(rows):
            if j % 2 == 0:
                self.set_fill_color(245, 245, 245)
            else:
                self.set_fill_color(255, 255, 255)
            for i, val in enumerate(row):
                if i == 0:
                    self.set_text_color(51, 64, 79)
                    self.set_font('Helvetica', '', 9)
                else:
                    if val == 'Si':
                        self.set_text_color(34, 139, 34)
                        self.set_font('Helvetica', 'B', 9)
                    else:
                        self.set_text_color(200, 60, 60)
                        self.set_font('Helvetica', '', 9)
                self.cell(col_w[i], 7, val, border=1, align='C', fill=True)
            self.ln()
        self.ln(5)


pdf = PDF()
pdf.alias_nb_pages()
pdf.set_auto_page_break(auto=True, margin=20)

# ==================== PAGE 1: ADMIN ====================
pdf.add_page()

pdf.section_title('1. ADMINISTRADOR (Admin)')
pdf.body_text('El administrador tiene control total de la plataforma. Accede desde /admin con credenciales de admin.')

pdf.subtitle('Gestion de Residencias')
pdf.bullet('Aprobar o rechazar residencias pendientes de registro')
pdf.bullet('Crear residencias manualmente (con Google Place ID para auto-obtener datos)')
pdf.bullet('Crear residencias masivamente via Excel (.xlsx)')
pdf.bullet('Editar TODOS los campos de cualquier residencia (nombre, descripcion, telefono, direccion, etc.)')
pdf.bullet('Subir y eliminar fotos de galeria (max 3)')
pdf.bullet('Subir y eliminar fotos del slider premium')
pdf.bullet('Seleccionar foto de galeria como foto de perfil')
pdf.bullet('Editar amenidades/servicios de cualquier residencia')
pdf.bullet('Editar redes sociales y video YouTube')
pdf.bullet('Verificar residencia (Sello Resolucion Sanitaria)')

pdf.subtitle('Gestion de Planes')
pdf.bullet('Asignar plan a una residencia: Destacado, Premium o Premium+')
pdf.bullet('Activar o desactivar el plan')
pdf.bullet('Toggle Destacado (is_featured_admin)')
pdf.bullet('El plan controla que puede editar la residencia en su propia cuenta')

pdf.subtitle('Gestion de Credenciales')
pdf.bullet('Cambiar el email de login de una residencia')
pdf.bullet('Crear o cambiar la contrasena de una residencia')
pdf.bullet('Enviar las credenciales a la residencia para que acceda a su cuenta')

pdf.subtitle('Otros')
pdf.bullet('Ver metricas: usuarios, residencias, pendientes, verificados, planes activos')
pdf.bullet('Gestionar resenas (aprobar/rechazar)')
pdf.bullet('Gestionar leads y trafico')
pdf.bullet('Gestionar blog (crear, editar, eliminar articulos)')
pdf.bullet('Gestionar convenios (SeniorClub)')
pdf.bullet('Ver diagnosticos del sistema (/api/diagnostics)')

# ==================== PAGE 2: RESIDENCIA ====================
pdf.add_page()

pdf.section_title('2. RESIDENCIA (Proveedor)')
pdf.body_text('La residencia accede con las credenciales que le entrega el admin. Su panel esta en /provider/dashboard y su cuenta en /provider/account.')

pdf.subtitle('Dashboard (/provider/dashboard)')
pdf.bullet('Ver su plan actual (Destacado, Premium, Premium+ o Sin plan)')
pdf.bullet('Ver solicitudes publicadas (care requests)')
pdf.bullet('Ver solicitudes de contacto recibidas de clientes (solo Premium y Premium+)')
pdf.bullet('Gestionar sucursales (crear, editar)')

pdf.subtitle('Mi Cuenta (/provider/account) - Segun Plan')
pdf.body_text('Los campos editables dependen del plan asignado por el admin:')

pdf.plan_table()

pdf.subtitle('Sin Plan Activo')
pdf.bullet('Todas las pestanas bloqueadas')
pdf.bullet('Mensaje: "No tienes un plan activo. Contacta a hola@senioradvisor.cl"')

pdf.subtitle('Contacto Comercial')
pdf.body_text('Para cambiar de plan o contratar: hola@senioradvisor.cl')

# ==================== PAGE 3: CLIENTE ====================
pdf.add_page()

pdf.section_title('3. CLIENTE (Familia)')
pdf.body_text('El cliente se registra libremente y busca residencias para un adulto mayor. No necesita plan ni pago.')

pdf.subtitle('Busqueda')
pdf.bullet('Buscar residencias por nombre, comuna o direccion')
pdf.bullet('Filtrar por categoria: Residencias, Cuidado a Domicilio, Salud Mental, o Todos')
pdf.bullet('Ver resultados ordenados: Premium+ primero, luego Premium, Destacado y el resto')
pdf.bullet('Ver mapa con ubicaciones')

pdf.subtitle('Perfil de Residencia')
pdf.bullet('Ver fotos, descripcion, amenidades, precios')
pdf.bullet('Ver resenas de usuarios y de Google')
pdf.bullet('Ver mapa de ubicacion')
pdf.bullet('Ver video YouTube (si la residencia es Premium+)')
pdf.bullet('Ver slider premium de fotos (si la residencia es Premium+)')
pdf.bullet('Ver telefono y WhatsApp (si la residencia es Premium o Premium+)')
pdf.bullet('Para residencias sin plan Premium: telefono y WhatsApp aparecen bloqueados')

pdf.subtitle('Interaccion')
pdf.bullet('Enviar solicitud de contacto a una residencia')
pdf.bullet('Chat directo con residencias Premium y Premium+')
pdf.bullet('Guardar residencias en favoritos')
pdf.bullet('Escribir resenas (5 criterios: personal, instalaciones, visitas, comida, actividades)')
pdf.bullet('Publicar solicitudes de servicio (formulario 3 pasos)')

pdf.subtitle('Otros')
pdf.bullet('Acceder a SeniorClub (convenios y descuentos)')
pdf.bullet('Ver pagina de Destacados')
pdf.bullet('Ver FAQ, Politica de Privacidad, Terminos de Uso')

# ==================== PAGE 4: ORDEN DE APARICION ====================
pdf.add_page()

pdf.section_title('4. ORDEN DE APARICION EN BUSQUEDA')
pdf.body_text('Las residencias aparecen en el siguiente orden estricto en todos los listados (busqueda, mapa, destacados):')

pdf.ln(3)
pdf.set_font('Helvetica', 'B', 12)
pdf.set_text_color(51, 64, 79)

order = [
    ('1ro', 'Premium+', 'Corona dorada + badge dorado', 'Todas las funciones'),
    ('2do', 'Premium', 'Badge oscuro sin corona', 'Funciones intermedias'),
    ('3ro', 'Destacado', 'Badge gris con estrella', 'Funciones basicas'),
    ('4to', 'Sin plan', 'Sin badge', 'Solo visible, sin edicion propia'),
]

col_w = [15, 30, 55, 70]
pdf.set_fill_color(51, 64, 79)
pdf.set_text_color(255, 255, 255)
pdf.set_font('Helvetica', 'B', 10)
for i, h in enumerate(['#', 'Plan', 'Badge', 'Descripcion']):
    pdf.cell(col_w[i], 8, h, border=1, align='C', fill=True)
pdf.ln()

pdf.set_font('Helvetica', '', 10)
for j, (pos, plan, badge, desc) in enumerate(order):
    if j % 2 == 0:
        pdf.set_fill_color(245, 245, 245)
    else:
        pdf.set_fill_color(255, 255, 255)
    pdf.set_text_color(51, 64, 79)
    pdf.cell(col_w[0], 7, pos, border=1, align='C', fill=True)
    pdf.set_font('Helvetica', 'B', 10)
    pdf.cell(col_w[1], 7, plan, border=1, align='C', fill=True)
    pdf.set_font('Helvetica', '', 10)
    pdf.cell(col_w[2], 7, badge, border=1, align='C', fill=True)
    pdf.cell(col_w[3], 7, desc, border=1, align='C', fill=True)
    pdf.ln()

pdf.ln(8)
pdf.section_title('5. CONTACTO COMERCIAL')
pdf.body_text('Toda gestion comercial de planes se realiza a traves de:')
pdf.ln(2)
pdf.set_font('Helvetica', 'B', 14)
pdf.set_text_color(0, 231, 255)
pdf.cell(0, 10, 'hola@senioradvisor.cl', align='C', ln=True)

pdf.output('/app/SeniorAdvisor_Roles_Permisos.pdf')
print('PDF generado: /app/SeniorAdvisor_Roles_Permisos.pdf')
