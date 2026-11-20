-- Calendar display settings only; attendance jobs and leave-duration rules are unchanged.
CREATE TABLE public.calendar_settings (
    organization_id BIGINT PRIMARY KEY REFERENCES public.organization(id) ON DELETE CASCADE,
    weekend_days INTEGER[] NOT NULL DEFAULT ARRAY[0, 6],
    CONSTRAINT valid_weekend_days CHECK (
        cardinality(weekend_days) <= 7
        AND weekend_days <@ ARRAY[0, 1, 2, 3, 4, 5, 6]
        AND array_position(weekend_days, NULL) IS NULL
    )
);

ALTER TABLE public.calendar_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.calendar_settings FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.calendar_settings TO authenticated;
GRANT ALL ON public.calendar_settings TO service_role;

CREATE POLICY "Members read their calendar settings"
ON public.calendar_settings FOR SELECT TO authenticated
USING (organization_id = (
    SELECT organization_id FROM public.profiles WHERE id = (SELECT auth.uid())
));

CREATE POLICY "Admins insert their calendar settings"
ON public.calendar_settings FOR INSERT TO authenticated
WITH CHECK (organization_id = (
    SELECT organization_id FROM public.profiles
    WHERE id = (SELECT auth.uid()) AND role = 'admin'
));

CREATE POLICY "Admins update their calendar settings"
ON public.calendar_settings FOR UPDATE TO authenticated
USING (organization_id = (
    SELECT organization_id FROM public.profiles
    WHERE id = (SELECT auth.uid()) AND role = 'admin'
))
WITH CHECK (organization_id = (
    SELECT organization_id FROM public.profiles
    WHERE id = (SELECT auth.uid()) AND role = 'admin'
));
