import React, { createContext, useState, useEffect } from 'react';
import initialContacts from './contacts';

export const WhatsappContext = createContext();

const initialMessages = [
    { id: 1, contactId: 1, texto: "¡Hola! ¿Cómo estas?", fecha: "8:30 a. m.", sentByMe: false },
    { id: 2, contactId: 1, texto: "¡Todo bien! ¿Y vos?", fecha: "8:32 a. m.", sentByMe: true },
    { id: 3, contactId: 1, texto: "Bien, estudiando un poco.", fecha: "8:33 a. m.", sentByMe: false },
    { id: 4, contactId: 2, texto: "¡Salen hoy a la noche?", fecha: "5:00 p. m.", sentByMe: false },
    { id: 5, contactId: 2, texto: "¡Holaaa! Sí, dale.", fecha: "5:05 p. m.", sentByMe: true },
    { id: 6, contactId: 3, texto: "¿Te enteraste lo de ayer?", fecha: "3:45 p. m.", sentByMe: false },
    { id: 7, contactId: 4, texto: "Hola, ¿pudieron avanzar?", fecha: "12:47 a. m.", sentByMe: false, senderId: 1 },
    { id: 8, contactId: 4, texto: "Sí, yo ya armé los componentes. Me falta mucho todavia.", fecha: "12:50 a. m.", sentByMe: false, senderId: 2 },
    { id: 9, contactId: 4, texto: "¡Buenísimo!", fecha: "11:28 p. m.", sentByMe: true },
    { id: 10, contactId: 5, texto: "¡Hola! ¿Viste el trabajo?", fecha: "10:35 a. m.", sentByMe: false },
    { id: 11, contactId: 5, texto: "Hola, sí lo vi, gracias.", fecha: "10:50 a. m.", sentByMe: true },
    { id: 12, contactId: 6, texto: "¿Vamos a correr más tarde?", fecha: "5:00 p. m.", sentByMe: false },
    { id: 13, contactId: 6, texto: "Dale, te aviso cuando me desocupe.", fecha: "5:05 p. m.", sentByMe: true },
    { id: 14, contactId: 7, texto: "Che, ¿me pasas lo de ayer?", fecha: "7:00 a. m.", sentByMe: false },
    { id: 15, contactId: 7, texto: "Ahora te lo mando.", fecha: "7:15 a. m.", sentByMe: true },
    { id: 16, contactId: 8, texto: "Te felicito por el título!! 🎉", fecha: "8:00 a. m.", sentByMe: false },
    { id: 17, contactId: 8, texto: "Muchas gracias!! Nos vemos el finde.", fecha: "8:30 a. m.", sentByMe: true },
    { id: 18, contactId: 9, texto: "¿Vamos al cine, hoy a las 20?", fecha: "2:30 p. m.", sentByMe: false },
    { id: 19, contactId: 9, texto: "Si, te busco.", fecha: "2:45 p. m.", sentByMe: true }
];

export function WhatsappProvider({ children }) {
    const [contacts, setContacts] = useState(() => {
        const saved = localStorage.getItem('whatsapp_contacts');
        if (saved) {
            const parsed = JSON.parse(saved);
            
            const missingContacts = initialContacts.filter(ic => !parsed.find(pc => String(pc.id) === String(ic.id)));
            const combined = [...parsed, ...missingContacts];
            return combined.map(c => {
                const initialDef = initialContacts.find(ic => String(ic.id) === String(c.id));
                const merged = {
                    telefono: "+54 9 11 1234-5678",
                    wallpaper: "4",
                    ...c
                };
                // Sincronización forzada: el avatar de los contactos seed siempre
                // proviene de contacts.jsx, pisando rutas viejas guardadas en localStorage
                if (initialDef && initialDef.avatar) {
                    merged.avatar = initialDef.avatar;
                }
                return merged;
            });
        }
        return initialContacts;
    });

    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem('whatsapp_messages');
        if (saved) {
            let parsed = JSON.parse(saved);

            // Sincronización forzada: los mensajes semilla de esta lista siempre
            // se muestran con sus textos/fechas actuales, pisando lo guardado en
            // localStorage. Los mensajes escritos por el usuario (ids Date.now())
            // se conservan sin cambios.
            const seedById = new Map(initialMessages.map(m => [String(m.id), m]));
            parsed = parsed.map(m => {
                const seed = seedById.get(String(m.id));
                return seed ? { ...m, ...seed } : m;
            });

            const missingMessages = initialMessages.filter(
                sm => !parsed.some(m => String(m.id) === String(sm.id))
            );
            if (missingMessages.length > 0) {
                parsed = [...parsed, ...missingMessages];
            }

            return parsed;
        }
        return initialMessages;
    });

    useEffect(() => {
        localStorage.setItem('whatsapp_contacts', JSON.stringify(contacts));
    }, [contacts]);

    useEffect(() => {
        localStorage.setItem('whatsapp_messages', JSON.stringify(messages));
    }, [messages]);

    const getContactById = (contactId) => {
        return contacts.find(c => String(c.id) === String(contactId));
    };

    const getMessageById = (messageId) => {
        return messages.find(m => String(m.id) === String(messageId));
    };

    const createContact = (contactData) => {
        const newContact = {
            id: Date.now(),
            nombre: contactData.nombre || 'Sin nombre',
            telefono: contactData.telefono || `+54 9 11 ${Math.floor(10000000 + Math.random() * 90000000)}`,
            fecha_ult_conexion: contactData.fecha_ult_conexion || 'Desconectado',
            mensajes_sin_ver: contactData.mensajes_sin_ver || 0,
            avatarColor: contactData.avatarColor || '#3b82f6',
            wallpaper: contactData.wallpaper || '4',
            isGroup: !!contactData.isGroup,
            descripcion: contactData.descripcion || '',
            integrantes: contactData.integrantes || []
        };
        setContacts(prev => [newContact, ...prev]);
        return newContact;
    };

    const deleteContact = (contactId) => {
        setContacts(prev => prev.filter(c => String(c.id) !== String(contactId)));
        setMessages(prev => prev.filter(m => String(m.contactId) !== String(contactId)));
    };

    const createMessage = (messageData) => {
        const now = new Date();
        const hours24 = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours24 >= 12 ? 'p. m.' : 'a. m.';
        const hours12 = hours24 % 12 || 12;
        const formattedTime = `${hours12}:${minutes} ${ampm}`;

        const newMessage = {
            id: Date.now(),
            contactId: messageData.contactId,
            texto: messageData.texto || '',
            fecha: formattedTime,
            timestamp: now.getTime(),
            sentByMe: messageData.sentByMe !== undefined ? messageData.sentByMe : true,
            senderId: messageData.senderId
        };
        setMessages(prev => [...prev, newMessage]);
        return newMessage;
    };

    const deleteMessage = (messageId) => {
        setMessages(prev => prev.filter(m => String(m.id) !== String(messageId)));
    };

    const updateContactById = (contactId, updatedData) => {
        setContacts(prev => prev.map(c => {
            if (String(c.id) === String(contactId)) {
                return { ...c, ...updatedData };
            }
            return c;
        }));
    };

    return (
        <WhatsappContext.Provider value={{
            contacts,
            messages,
            getContactById,
            getMessageById,
            createContact,
            deleteContact,
            createMessage,
            deleteMessage,
            updateContactById
        }}>
            {children}
        </WhatsappContext.Provider>
    );
}