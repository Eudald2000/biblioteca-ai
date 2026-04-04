-- TODO: Ejecutar esta migración cuando pg_net esté habilitado y la edge function desplegada
--
-- Requisitos:
--   1. Extensión pg_net habilitada (Dashboard → Database → Extensions → pg_net)
--   2. Edge function 'enviar-recordatorio' desplegada:
--        supabase functions deploy enviar-recordatorio
--   3. RESEND_API_KEY configurado:
--        supabase secrets set RESEND_API_KEY=re_xxxx

-- Trigger: enviar recordatorio automático cuando un préstamo pasa a estado 'vencido'
CREATE OR REPLACE FUNCTION public.trigger_recordatorio_prestamo_vencido()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Solo actuar cuando el estado cambia a 'vencido'
  IF NEW.estado = 'vencido' AND (OLD.estado IS DISTINCT FROM 'vencido') THEN
    PERFORM net.http_post(
      url    := current_setting('app.supabase_url') || '/functions/v1/enviar-recordatorio',
      body   := jsonb_build_object('prestamo_id', NEW.id),
      headers := jsonb_build_object(
        'Content-Type',  'application/json',
        'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key')
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER recordatorio_prestamo_vencido
  AFTER UPDATE ON public.prestamos
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_recordatorio_prestamo_vencido();
