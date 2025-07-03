export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
  gis: {
    Tables: {
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown | null
          f_table_catalog: unknown | null
          f_table_name: unknown | null
          f_table_schema: unknown | null
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown | null
          f_table_catalog: string | null
          f_table_name: unknown | null
          f_table_schema: unknown | null
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown | null
          f_table_catalog?: string | null
          f_table_name?: unknown | null
          f_table_schema?: unknown | null
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown | null
          f_table_catalog?: string | null
          f_table_name?: unknown | null
          f_table_schema?: unknown | null
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: {
          oldname: string
          newname: string
          version: string
        }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: {
          tbl: unknown
          col: string
        }
        Returns: unknown
      }
      _postgis_pgsql_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _postgis_scripts_pgsql_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _postgis_selectivity: {
        Args: {
          tbl: unknown
          att_name: string
          geom: unknown
          mode?: string
        }
        Returns: number
      }
      _st_3dintersects: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      _st_bestsrid: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      _st_contains: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      _st_coveredby:
          | {
        Args: {
          geog1: unknown
          geog2: unknown
        }
        Returns: boolean
      }
          | {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      _st_covers:
          | {
        Args: {
          geog1: unknown
          geog2: unknown
        }
        Returns: boolean
      }
          | {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      _st_crosses: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      _st_intersects: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: {
          line1: unknown
          line2: unknown
        }
        Returns: number
      }
      _st_longestline: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: number
      }
      _st_orderingequals: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      _st_overlaps: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      _st_pointoutside: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      _st_sortablehash: {
        Args: {
          geom: unknown
        }
        Returns: number
      }
      _st_touches: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          g1: unknown
          clip?: unknown
          tolerance?: number
          return_polygons?: boolean
        }
        Returns: unknown
      }
      _st_within: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      addauth: {
        Args: {
          "": string
        }
        Returns: boolean
      }
      addgeometrycolumn:
          | {
        Args: {
          catalog_name: string
          schema_name: string
          table_name: string
          column_name: string
          new_srid_in: number
          new_type: string
          new_dim: number
          use_typmod?: boolean
        }
        Returns: string
      }
          | {
        Args: {
          schema_name: string
          table_name: string
          column_name: string
          new_srid: number
          new_type: string
          new_dim: number
          use_typmod?: boolean
        }
        Returns: string
      }
          | {
        Args: {
          table_name: string
          column_name: string
          new_srid: number
          new_type: string
          new_dim: number
          use_typmod?: boolean
        }
        Returns: string
      }
      box:
          | {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
          | {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      box2d:
          | {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
          | {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      box2d_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      box2d_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      box2df_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      box2df_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      box3d:
          | {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
          | {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      box3d_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      box3d_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      box3dtobox: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      bytea:
          | {
        Args: {
          "": unknown
        }
        Returns: string
      }
          | {
        Args: {
          "": unknown
        }
        Returns: string
      }
      disablelongtransactions: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      dropgeometrycolumn:
          | {
        Args: {
          catalog_name: string
          schema_name: string
          table_name: string
          column_name: string
        }
        Returns: string
      }
          | {
        Args: {
          schema_name: string
          table_name: string
          column_name: string
        }
        Returns: string
      }
          | {
        Args: {
          table_name: string
          column_name: string
        }
        Returns: string
      }
      dropgeometrytable:
          | {
        Args: {
          catalog_name: string
          schema_name: string
          table_name: string
        }
        Returns: string
      }
          | {
        Args: {
          schema_name: string
          table_name: string
        }
        Returns: string
      }
          | {
        Args: {
          table_name: string
        }
        Returns: string
      }
      enablelongtransactions: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      equals: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geography:
          | {
        Args: {
          "": string
        }
        Returns: unknown
      }
          | {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geography_analyze: {
        Args: {
          "": unknown
        }
        Returns: boolean
      }
      geography_gist_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geography_gist_decompress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geography_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geography_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      geography_spgist_compress_nd: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geography_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      geography_typmod_out: {
        Args: {
          "": number
        }
        Returns: unknown
      }
      geometry:
          | {
        Args: {
          "": string
        }
        Returns: unknown
      }
          | {
        Args: {
          "": string
        }
        Returns: unknown
      }
          | {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
          | {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
          | {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
          | {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
          | {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
          | {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geometry_above: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_analyze: {
        Args: {
          "": unknown
        }
        Returns: boolean
      }
      geometry_below: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_cmp: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: number
      }
      geometry_contained_3d: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_contains: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: number
      }
      geometry_eq: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_ge: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_gist_compress_2d: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geometry_gist_compress_nd: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geometry_gist_decompress_2d: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geometry_gist_decompress_nd: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geometry_gist_sortsupport_2d: {
        Args: {
          "": unknown
        }
        Returns: undefined
      }
      geometry_gt: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_hash: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      geometry_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geometry_le: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_left: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_lt: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geometry_overabove: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_overleft: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_overright: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_recv: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geometry_right: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_same: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      geometry_sortsupport: {
        Args: {
          "": unknown
        }
        Returns: undefined
      }
      geometry_spgist_compress_2d: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geometry_spgist_compress_3d: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geometry_spgist_compress_nd: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geometry_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      geometry_typmod_out: {
        Args: {
          "": number
        }
        Returns: unknown
      }
      geometry_within: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometrytype:
          | {
        Args: {
          "": unknown
        }
        Returns: string
      }
          | {
        Args: {
          "": unknown
        }
        Returns: string
      }
      geomfromewkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      geomfromewkt: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      get_proj4_from_srid: {
        Args: {
          "": number
        }
        Returns: string
      }
      gettransactionid: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      gidx_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gidx_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      json: {
        Args: {
          "": unknown
        }
        Returns: Json
      }
      jsonb: {
        Args: {
          "": unknown
        }
        Returns: Json
      }
      longtransactionsenabled: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      path: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      pgis_asflatgeobuf_finalfn: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      pgis_asgeobuf_finalfn: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      pgis_asmvt_finalfn: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      pgis_asmvt_serialfn: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      pgis_geometry_clusterintersecting_finalfn: {
        Args: {
          "": unknown
        }
        Returns: unknown[]
      }
      pgis_geometry_clusterwithin_finalfn: {
        Args: {
          "": unknown
        }
        Returns: unknown[]
      }
      pgis_geometry_collect_finalfn: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      pgis_geometry_makeline_finalfn: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      pgis_geometry_polygonize_finalfn: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      pgis_geometry_union_parallel_finalfn: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      pgis_geometry_union_parallel_serialfn: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      point: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      polygon: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      populate_geometry_columns:
          | {
        Args: {
          tbl_oid: unknown
          use_typmod?: boolean
        }
        Returns: number
      }
          | {
        Args: {
          use_typmod?: boolean
        }
        Returns: string
      }
      postgis_addbbox: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      postgis_constraint_dims: {
        Args: {
          geomschema: string
          geomtable: string
          geomcolumn: string
        }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: {
          geomschema: string
          geomtable: string
          geomcolumn: string
        }
        Returns: number
      }
      postgis_constraint_type: {
        Args: {
          geomschema: string
          geomtable: string
          geomcolumn: string
        }
        Returns: string
      }
      postgis_dropbbox: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      postgis_extensions_upgrade: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_full_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_geos_noop: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      postgis_geos_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_getbbox: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      postgis_hasbbox: {
        Args: {
          "": unknown
        }
        Returns: boolean
      }
      postgis_index_supportfn: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      postgis_lib_build_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_lib_revision: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_lib_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libjson_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_liblwgeom_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libprotobuf_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libxml_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_noop: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      postgis_proj_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_build_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_installed: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_released: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_svn_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_type_name: {
        Args: {
          geomname: string
          coord_dimension: number
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_typmod_dims: {
        Args: {
          "": number
        }
        Returns: number
      }
      postgis_typmod_srid: {
        Args: {
          "": number
        }
        Returns: number
      }
      postgis_typmod_type: {
        Args: {
          "": number
        }
        Returns: string
      }
      postgis_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_wagyu_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      spheroid_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      spheroid_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_3dclosestpoint: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_3ddistance: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: number
      }
      st_3dintersects: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      st_3dlength: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_3dlongestline: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: number
      }
      st_3dperimeter: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_3dshortestline: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_addpoint: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_angle:
          | {
        Args: {
          line1: unknown
          line2: unknown
        }
        Returns: number
      }
          | {
        Args: {
          pt1: unknown
          pt2: unknown
          pt3: unknown
          pt4?: unknown
        }
        Returns: number
      }
      st_area:
          | {
        Args: {
          "": string
        }
        Returns: number
      }
          | {
        Args: {
          "": unknown
        }
        Returns: number
      }
          | {
        Args: {
          geog: unknown
          use_spheroid?: boolean
        }
        Returns: number
      }
      st_area2d: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_asbinary:
          | {
        Args: {
          "": unknown
        }
        Returns: string
      }
          | {
        Args: {
          "": unknown
        }
        Returns: string
      }
      st_asencodedpolyline: {
        Args: {
          geom: unknown
          nprecision?: number
        }
        Returns: string
      }
      st_asewkb: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      st_asewkt:
          | {
        Args: {
          "": string
        }
        Returns: string
      }
          | {
        Args: {
          "": unknown
        }
        Returns: string
      }
          | {
        Args: {
          "": unknown
        }
        Returns: string
      }
      st_asgeojson:
          | {
        Args: {
          "": string
        }
        Returns: string
      }
          | {
        Args: {
          geog: unknown
          maxdecimaldigits?: number
          options?: number
        }
        Returns: string
      }
          | {
        Args: {
          geom: unknown
          maxdecimaldigits?: number
          options?: number
        }
        Returns: string
      }
          | {
        Args: {
          r: Record<string, unknown>
          geom_column?: string
          maxdecimaldigits?: number
          pretty_bool?: boolean
        }
        Returns: string
      }
      st_asgml:
          | {
        Args: {
          "": string
        }
        Returns: string
      }
          | {
        Args: {
          geog: unknown
          maxdecimaldigits?: number
          options?: number
          nprefix?: string
          id?: string
        }
        Returns: string
      }
          | {
        Args: {
          geom: unknown
          maxdecimaldigits?: number
          options?: number
        }
        Returns: string
      }
          | {
        Args: {
          version: number
          geog: unknown
          maxdecimaldigits?: number
          options?: number
          nprefix?: string
          id?: string
        }
        Returns: string
      }
          | {
        Args: {
          version: number
          geom: unknown
          maxdecimaldigits?: number
          options?: number
          nprefix?: string
          id?: string
        }
        Returns: string
      }
      st_ashexewkb: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      st_askml:
          | {
        Args: {
          "": string
        }
        Returns: string
      }
          | {
        Args: {
          geog: unknown
          maxdecimaldigits?: number
          nprefix?: string
        }
        Returns: string
      }
          | {
        Args: {
          geom: unknown
          maxdecimaldigits?: number
          nprefix?: string
        }
        Returns: string
      }
      st_aslatlontext: {
        Args: {
          geom: unknown
          tmpl?: string
        }
        Returns: string
      }
      st_asmarc21: {
        Args: {
          geom: unknown
          format?: string
        }
        Returns: string
      }
      st_asmvtgeom: {
        Args: {
          geom: unknown
          bounds: unknown
          extent?: number
          buffer?: number
          clip_geom?: boolean
        }
        Returns: unknown
      }
      st_assvg:
          | {
        Args: {
          "": string
        }
        Returns: string
      }
          | {
        Args: {
          geog: unknown
          rel?: number
          maxdecimaldigits?: number
        }
        Returns: string
      }
          | {
        Args: {
          geom: unknown
          rel?: number
          maxdecimaldigits?: number
        }
        Returns: string
      }
      st_astext:
          | {
        Args: {
          "": string
        }
        Returns: string
      }
          | {
        Args: {
          "": unknown
        }
        Returns: string
      }
          | {
        Args: {
          "": unknown
        }
        Returns: string
      }
      st_astwkb:
          | {
        Args: {
          geom: unknown[]
          ids: number[]
          prec?: number
          prec_z?: number
          prec_m?: number
          with_sizes?: boolean
          with_boxes?: boolean
        }
        Returns: string
      }
          | {
        Args: {
          geom: unknown
          prec?: number
          prec_z?: number
          prec_m?: number
          with_sizes?: boolean
          with_boxes?: boolean
        }
        Returns: string
      }
      st_asx3d: {
        Args: {
          geom: unknown
          maxdecimaldigits?: number
          options?: number
        }
        Returns: string
      }
      st_azimuth:
          | {
        Args: {
          geog1: unknown
          geog2: unknown
        }
        Returns: number
      }
          | {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: number
      }
      st_boundary: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_boundingdiagonal: {
        Args: {
          geom: unknown
          fits?: boolean
        }
        Returns: unknown
      }
      st_buffer:
          | {
        Args: {
          geom: unknown
          radius: number
          options?: string
        }
        Returns: unknown
      }
          | {
        Args: {
          geom: unknown
          radius: number
          quadsegs: number
        }
        Returns: unknown
      }
      st_buildarea: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_centroid:
          | {
        Args: {
          "": string
        }
        Returns: unknown
      }
          | {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_cleangeometry: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_clipbybox2d: {
        Args: {
          geom: unknown
          box: unknown
        }
        Returns: unknown
      }
      st_closestpoint: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_clusterintersecting: {
        Args: {
          "": unknown[]
        }
        Returns: unknown[]
      }
      st_collect:
          | {
        Args: {
          "": unknown[]
        }
        Returns: unknown
      }
          | {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_collectionextract: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_collectionhomogenize: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_concavehull: {
        Args: {
          param_geom: unknown
          param_pctconvex: number
          param_allow_holes?: boolean
        }
        Returns: unknown
      }
      st_contains: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      st_containsproperly: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      st_convexhull: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_coorddim: {
        Args: {
          geometry: unknown
        }
        Returns: number
      }
      st_coveredby:
          | {
        Args: {
          geog1: unknown
          geog2: unknown
        }
        Returns: boolean
      }
          | {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      st_covers:
          | {
        Args: {
          geog1: unknown
          geog2: unknown
        }
        Returns: boolean
      }
          | {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      st_crosses: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      st_curvetoline: {
        Args: {
          geom: unknown
          tol?: number
          toltype?: number
          flags?: number
        }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: {
          g1: unknown
          tolerance?: number
          flags?: number
        }
        Returns: unknown
      }
      st_difference: {
        Args: {
          geom1: unknown
          geom2: unknown
          gridsize?: number
        }
        Returns: unknown
      }
      st_dimension: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_disjoint: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      st_distance:
          | {
        Args: {
          geog1: unknown
          geog2: unknown
          use_spheroid?: boolean
        }
        Returns: number
      }
          | {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: number
      }
      st_distancesphere:
          | {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: number
      }
          | {
        Args: {
          geom1: unknown
          geom2: unknown
          radius: number
        }
        Returns: number
      }
      st_distancespheroid: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: number
      }
      st_dump: {
        Args: {
          "": unknown
        }
        Returns: Database["gis"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumppoints: {
        Args: {
          "": unknown
        }
        Returns: Database["gis"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumprings: {
        Args: {
          "": unknown
        }
        Returns: Database["gis"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumpsegments: {
        Args: {
          "": unknown
        }
        Returns: Database["gis"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_endpoint: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_envelope: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_equals: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      st_expand:
          | {
        Args: {
          box: unknown
          dx: number
          dy: number
        }
        Returns: unknown
      }
          | {
        Args: {
          box: unknown
          dx: number
          dy: number
          dz?: number
        }
        Returns: unknown
      }
          | {
        Args: {
          geom: unknown
          dx: number
          dy: number
          dz?: number
          dm?: number
        }
        Returns: unknown
      }
      st_exteriorring: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_flipcoordinates: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_force2d: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_force3d: {
        Args: {
          geom: unknown
          zvalue?: number
        }
        Returns: unknown
      }
      st_force3dm: {
        Args: {
          geom: unknown
          mvalue?: number
        }
        Returns: unknown
      }
      st_force3dz: {
        Args: {
          geom: unknown
          zvalue?: number
        }
        Returns: unknown
      }
      st_force4d: {
        Args: {
          geom: unknown
          zvalue?: number
          mvalue?: number
        }
        Returns: unknown
      }
      st_forcecollection: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_forcecurve: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_forcepolygonccw: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_forcepolygoncw: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_forcerhr: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_forcesfs: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_generatepoints:
          | {
        Args: {
          area: unknown
          npoints: number
        }
        Returns: unknown
      }
          | {
        Args: {
          area: unknown
          npoints: number
          seed: number
        }
        Returns: unknown
      }
      st_geogfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_geogfromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_geographyfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_geohash:
          | {
        Args: {
          geog: unknown
          maxchars?: number
        }
        Returns: string
      }
          | {
        Args: {
          geom: unknown
          maxchars?: number
        }
        Returns: string
      }
      st_geomcollfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_geomcollfromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_geometricmedian: {
        Args: {
          g: unknown
          tolerance?: number
          max_iter?: number
          fail_if_not_converged?: boolean
        }
        Returns: unknown
      }
      st_geometryfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_geometrytype: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      st_geomfromewkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_geomfromewkt: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_geomfromgeojson:
          | {
        Args: {
          "": Json
        }
        Returns: unknown
      }
          | {
        Args: {
          "": Json
        }
        Returns: unknown
      }
          | {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_geomfromgml: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_geomfromkml: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_geomfrommarc21: {
        Args: {
          marc21xml: string
        }
        Returns: unknown
      }
      st_geomfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_geomfromtwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_geomfromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_gmltosql: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_hasarc: {
        Args: {
          geometry: unknown
        }
        Returns: boolean
      }
      st_hausdorffdistance: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: number
      }
      st_hexagon: {
        Args: {
          size: number
          cell_i: number
          cell_j: number
          origin?: unknown
        }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: {
          size: number
          bounds: unknown
        }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: {
          line: unknown
          point: unknown
        }
        Returns: number
      }
      st_intersection: {
        Args: {
          geom1: unknown
          geom2: unknown
          gridsize?: number
        }
        Returns: unknown
      }
      st_intersects:
          | {
        Args: {
          geog1: unknown
          geog2: unknown
        }
        Returns: boolean
      }
          | {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      st_isclosed: {
        Args: {
          "": unknown
        }
        Returns: boolean
      }
      st_iscollection: {
        Args: {
          "": unknown
        }
        Returns: boolean
      }
      st_isempty: {
        Args: {
          "": unknown
        }
        Returns: boolean
      }
      st_ispolygonccw: {
        Args: {
          "": unknown
        }
        Returns: boolean
      }
      st_ispolygoncw: {
        Args: {
          "": unknown
        }
        Returns: boolean
      }
      st_isring: {
        Args: {
          "": unknown
        }
        Returns: boolean
      }
      st_issimple: {
        Args: {
          "": unknown
        }
        Returns: boolean
      }
      st_isvalid: {
        Args: {
          "": unknown
        }
        Returns: boolean
      }
      st_isvaliddetail: {
        Args: {
          geom: unknown
          flags?: number
        }
        Returns: Database["gis"]["CompositeTypes"]["valid_detail"]
      }
      st_isvalidreason: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      st_isvalidtrajectory: {
        Args: {
          "": unknown
        }
        Returns: boolean
      }
      st_length:
          | {
        Args: {
          "": string
        }
        Returns: number
      }
          | {
        Args: {
          "": unknown
        }
        Returns: number
      }
          | {
        Args: {
          geog: unknown
          use_spheroid?: boolean
        }
        Returns: number
      }
      st_length2d: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_letters: {
        Args: {
          letters: string
          font?: Json
        }
        Returns: unknown
      }
      st_linecrossingdirection: {
        Args: {
          line1: unknown
          line2: unknown
        }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: {
          txtin: string
          nprecision?: number
        }
        Returns: unknown
      }
      st_linefrommultipoint: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_linefromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_linefromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_linelocatepoint: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: number
      }
      st_linemerge: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_linestringfromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_linetocurve: {
        Args: {
          geometry: unknown
        }
        Returns: unknown
      }
      st_locatealong: {
        Args: {
          geometry: unknown
          measure: number
          leftrightoffset?: number
        }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          geometry: unknown
          frommeasure: number
          tomeasure: number
          leftrightoffset?: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: {
          geometry: unknown
          fromelevation: number
          toelevation: number
        }
        Returns: unknown
      }
      st_longestline: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_m: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_makebox2d: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_makeline:
          | {
        Args: {
          "": unknown[]
        }
        Returns: unknown
      }
          | {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_makepolygon: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_makevalid:
          | {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
          | {
        Args: {
          geom: unknown
          params: string
        }
        Returns: unknown
      }
      st_maxdistance: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: number
      }
      st_maximuminscribedcircle: {
        Args: {
          "": unknown
        }
        Returns: Record<string, unknown>
      }
      st_memsize: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: {
          inputgeom: unknown
          segs_per_quarter?: number
        }
        Returns: unknown
      }
      st_minimumboundingradius: {
        Args: {
          "": unknown
        }
        Returns: Record<string, unknown>
      }
      st_minimumclearance: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_minimumclearanceline: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_mlinefromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_mlinefromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_mpointfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_mpointfromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_mpolyfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_mpolyfromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_multi: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_multilinefromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_multilinestringfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_multipointfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_multipointfromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_multipolyfromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_multipolygonfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_ndims: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_node: {
        Args: {
          g: unknown
        }
        Returns: unknown
      }
      st_normalize: {
        Args: {
          geom: unknown
        }
        Returns: unknown
      }
      st_npoints: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_nrings: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_numgeometries: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_numinteriorring: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_numinteriorrings: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_numpatches: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_numpoints: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_offsetcurve: {
        Args: {
          line: unknown
          distance: number
          params?: string
        }
        Returns: unknown
      }
      st_orderingequals: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      st_orientedenvelope: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_overlaps: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      st_perimeter:
          | {
        Args: {
          "": unknown
        }
        Returns: number
      }
          | {
        Args: {
          geog: unknown
          use_spheroid?: boolean
        }
        Returns: number
      }
      st_perimeter2d: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_pointfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_pointfromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_pointm: {
        Args: {
          xcoordinate: number
          ycoordinate: number
          mcoordinate: number
          srid?: number
        }
        Returns: unknown
      }
      st_pointonsurface: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_points: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
          srid?: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
          mcoordinate: number
          srid?: number
        }
        Returns: unknown
      }
      st_polyfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_polyfromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_polygonfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_polygonfromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_polygonize: {
        Args: {
          "": unknown[]
        }
        Returns: unknown
      }
      st_project: {
        Args: {
          geog: unknown
          distance: number
          azimuth: number
        }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_x: number
          prec_y?: number
          prec_z?: number
          prec_m?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: {
          geom: unknown
          gridsize: number
        }
        Returns: unknown
      }
      st_relate: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: string
      }
      st_removerepeatedpoints: {
        Args: {
          geom: unknown
          tolerance?: number
        }
        Returns: unknown
      }
      st_reverse: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_segmentize: {
        Args: {
          geog: unknown
          max_segment_length: number
        }
        Returns: unknown
      }
      st_setsrid:
          | {
        Args: {
          geog: unknown
          srid: number
        }
        Returns: unknown
      }
          | {
        Args: {
          geom: unknown
          srid: number
        }
        Returns: unknown
      }
      st_sharedpaths: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_shiftlongitude: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_shortestline: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: {
          geom: unknown
          vertex_fraction: number
          is_outer?: boolean
        }
        Returns: unknown
      }
      st_split: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_square: {
        Args: {
          size: number
          cell_i: number
          cell_j: number
          origin?: unknown
        }
        Returns: unknown
      }
      st_squaregrid: {
        Args: {
          size: number
          bounds: unknown
        }
        Returns: Record<string, unknown>[]
      }
      st_srid:
          | {
        Args: {
          geog: unknown
        }
        Returns: number
      }
          | {
        Args: {
          geom: unknown
        }
        Returns: number
      }
      st_startpoint: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_subdivide: {
        Args: {
          geom: unknown
          maxvertices?: number
          gridsize?: number
        }
        Returns: unknown[]
      }
      st_summary:
          | {
        Args: {
          "": unknown
        }
        Returns: string
      }
          | {
        Args: {
          "": unknown
        }
        Returns: string
      }
      st_swapordinates: {
        Args: {
          geom: unknown
          ords: unknown
        }
        Returns: unknown
      }
      st_symdifference: {
        Args: {
          geom1: unknown
          geom2: unknown
          gridsize?: number
        }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          zoom: number
          x: number
          y: number
          bounds?: unknown
          margin?: number
        }
        Returns: unknown
      }
      st_touches: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      st_transform:
          | {
        Args: {
          geom: unknown
          from_proj: string
          to_proj: string
        }
        Returns: unknown
      }
          | {
        Args: {
          geom: unknown
          from_proj: string
          to_srid: number
        }
        Returns: unknown
      }
          | {
        Args: {
          geom: unknown
          to_proj: string
        }
        Returns: unknown
      }
      st_triangulatepolygon: {
        Args: {
          g1: unknown
        }
        Returns: unknown
      }
      st_union:
          | {
        Args: {
          "": unknown[]
        }
        Returns: unknown
      }
          | {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
          | {
        Args: {
          geom1: unknown
          geom2: unknown
          gridsize: number
        }
        Returns: unknown
      }
      st_voronoilines: {
        Args: {
          g1: unknown
          tolerance?: number
          extend_to?: unknown
        }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: {
          g1: unknown
          tolerance?: number
          extend_to?: unknown
        }
        Returns: unknown
      }
      st_within: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      st_wkbtosql: {
        Args: {
          wkb: string
        }
        Returns: unknown
      }
      st_wkttosql: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_wrapx: {
        Args: {
          geom: unknown
          wrap: number
          move: number
        }
        Returns: unknown
      }
      st_x: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_xmax: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_xmin: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_y: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_ymax: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_ymin: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_z: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_zmax: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_zmflag: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_zmin: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      text: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      unlockrows: {
        Args: {
          "": string
        }
        Returns: number
      }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          schema_name: string
          table_name: string
          column_name: string
          new_srid_in: number
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown | null
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown | null
      }
    }
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  pgbouncer: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_auth: {
        Args: {
          p_usename: string
        }
        Returns: {
          username: string
          password: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      age: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id?: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          changed_at: string | null
          changed_data: Json | null
          id: number
          operation: string
          table_name: string
          user_avatar: string | null
          user_first_name: string | null
          user_id: string | null
          user_last_name: string | null
        }
        Insert: {
          changed_at?: string | null
          changed_data?: Json | null
          id?: number
          operation: string
          table_name: string
          user_avatar?: string | null
          user_first_name?: string | null
          user_id?: string | null
          user_last_name?: string | null
        }
        Update: {
          changed_at?: string | null
          changed_data?: Json | null
          id?: number
          operation?: string
          table_name?: string
          user_avatar?: string | null
          user_first_name?: string | null
          user_id?: string | null
          user_last_name?: string | null
        }
        Relationships: []
      }
      collection: {
        Row: {
          age_id: number | null
          collect_id: string | null
          comment: string | null
          day: number | null
          gen_bank_id: string | null
          geo_comment: string | null
          id: number
          kind_id: number | null
          month: number | null
          point: unknown | null
          region_id: number | null
          sex_id: number | null
          vouch_id: string | null
          vouch_inst_id: number | null
          year: number | null
        }
        Insert: {
          age_id?: number | null
          collect_id?: string | null
          comment?: string | null
          day?: number | null
          gen_bank_id?: string | null
          geo_comment?: string | null
          id?: number
          kind_id?: number | null
          month?: number | null
          point?: unknown | null
          region_id?: number | null
          sex_id?: number | null
          vouch_id?: string | null
          vouch_inst_id?: number | null
          year?: number | null
        }
        Update: {
          age_id?: number | null
          collect_id?: string | null
          comment?: string | null
          day?: number | null
          gen_bank_id?: string | null
          geo_comment?: string | null
          id?: number
          kind_id?: number | null
          month?: number | null
          point?: unknown | null
          region_id?: number | null
          sex_id?: number | null
          vouch_id?: string | null
          vouch_inst_id?: number | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "collection_age_id_fk"
            columns: ["age_id"]
            referencedRelation: "age"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_kind_null_fk"
            columns: ["kind_id"]
            referencedRelation: "kind"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_region_fk"
            columns: ["region_id"]
            referencedRelation: "region"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_sex_id_fk"
            columns: ["sex_id"]
            referencedRelation: "sex"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_voucher_institute_null_fk"
            columns: ["vouch_inst_id"]
            referencedRelation: "voucher_institute"
            referencedColumns: ["id"]
          },
        ]
      }
      collector: {
        Row: {
          first_name: string | null
          id: number
          last_name: string
          second_name: string | null
        }
        Insert: {
          first_name?: string | null
          id?: number
          last_name: string
          second_name?: string | null
        }
        Update: {
          first_name?: string | null
          id?: number
          last_name?: string
          second_name?: string | null
        }
        Relationships: []
      }
      collector_to_collection: {
        Row: {
          collection_id: number
          collector_id: number
        }
        Insert: {
          collection_id: number
          collector_id: number
        }
        Update: {
          collection_id?: number
          collector_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "collector_to_collection_collection_null_fk"
            columns: ["collection_id"]
            referencedRelation: "basic_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collector_to_collection_collection_null_fk"
            columns: ["collection_id"]
            referencedRelation: "collection"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collector_to_collection_collection_null_fk"
            columns: ["collection_id"]
            referencedRelation: "csv_export_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collector_to_collection_collector_null_fk"
            columns: ["collector_id"]
            referencedRelation: "collector"
            referencedColumns: ["id"]
          },
        ]
      }
      country: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      family: {
        Row: {
          id: number
          name: string | null
          order_id: number
        }
        Insert: {
          id?: number
          name?: string | null
          order_id: number
        }
        Update: {
          id?: number
          name?: string | null
          order_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "family_order_null_fk"
            columns: ["order_id"]
            referencedRelation: "order"
            referencedColumns: ["id"]
          },
        ]
      }
      genus: {
        Row: {
          family_id: number
          id: number
          name: string | null
        }
        Insert: {
          family_id: number
          id?: number
          name?: string | null
        }
        Update: {
          family_id?: number
          id?: number
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "genus_family_null_fk"
            columns: ["family_id"]
            referencedRelation: "family"
            referencedColumns: ["id"]
          },
        ]
      }
      kind: {
        Row: {
          genus_id: number
          id: number
          name: string | null
        }
        Insert: {
          genus_id: number
          id?: number
          name?: string | null
        }
        Update: {
          genus_id?: number
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      order: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id?: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar: string | null
          first_name: string
          id: string
          last_name: string
        }
        Insert: {
          avatar?: string | null
          first_name?: string
          id: string
          last_name?: string
        }
        Update: {
          avatar?: string | null
          first_name?: string
          id?: string
          last_name?: string
        }
        Relationships: []
      }
      region: {
        Row: {
          country_id: number
          id: number
          name: string | null
        }
        Insert: {
          country_id: number
          id?: number
          name?: string | null
        }
        Update: {
          country_id?: number
          id?: number
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "region_country_null_fk"
            columns: ["country_id"]
            referencedRelation: "country"
            referencedColumns: ["id"]
          },
        ]
      }
      sex: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          color: string
          description: string | null
          id: number
          name: string
        }
        Insert: {
          color?: string
          description?: string | null
          id?: number
          name: string
        }
        Update: {
          color?: string
          description?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      tags_to_collection: {
        Row: {
          col_id: number
          tag_id: number
        }
        Insert: {
          col_id: number
          tag_id: number
        }
        Update: {
          col_id?: number
          tag_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "tags_to_collection_col_id_fkey"
            columns: ["col_id"]
            referencedRelation: "basic_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tags_to_collection_col_id_fkey"
            columns: ["col_id"]
            referencedRelation: "collection"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tags_to_collection_col_id_fkey"
            columns: ["col_id"]
            referencedRelation: "csv_export_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tags_to_collection_tag_id_fkey"
            columns: ["tag_id"]
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      voucher_institute: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      audit_logs_view: {
        Row: {
          changed_at: string | null
          changed_data: Json | null
          first_name: string | null
          id: number | null
          last_name: string | null
          operation: string | null
          table_name: string | null
          user_id: string | null
        }
        Insert: {
          changed_at?: string | null
          changed_data?: Json | null
          first_name?: string | null
          id?: number | null
          last_name?: string | null
          operation?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Update: {
          changed_at?: string | null
          changed_data?: Json | null
          first_name?: string | null
          id?: number | null
          last_name?: string | null
          operation?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      basic_view: {
        Row: {
          age: string | null
          collect_id: string | null
          collector_ids: number[] | null
          collectors:
              | Database["public"]["CompositeTypes"]["collector_type"][]
              | null
          comment: string | null
          country: string | null
          day: number | null
          edit_user_ids: string[] | null
          edit_users: Database["public"]["CompositeTypes"]["user_type"][] | null
          family: Database["public"]["CompositeTypes"]["topology_type"] | null
          genus: Database["public"]["CompositeTypes"]["topology_type"] | null
          geo_comment: string | null
          id: number | null
          kind: Database["public"]["CompositeTypes"]["topology_type"] | null
          last_modified: string | null
          last_modified_by: string | null
          last_modified_user_avatar: string | null
          last_modified_user_first_name: string | null
          last_modified_user_last_name: string | null
          last_operation: string | null
          latitude: number | null
          longitude: number | null
          month: number | null
          order: Database["public"]["CompositeTypes"]["topology_type"] | null
          region: string | null
          sex: string | null
          tag_ids: number[] | null
          tags: Database["public"]["CompositeTypes"]["tag_type"][] | null
          voucher_id: string | null
          voucher_institute: string | null
          year: number | null
        }
        Relationships: []
      }
      csv_export_view: {
        Row: {
          collect_id: string | null
          id: number | null
          Ваучер_ID: string | null
          Вид: string | null
          Возраст: string | null
          Все_редакторы: string | null
          Геокомментарий: string | null
          Дата: string | null
          Долгота: number | null
          Изменил_пользователь: string | null
          Институт: string | null
          Коллекторы: string | null
          Комментарий: string | null
          Операция: string | null
          Отряд: string | null
          Пол: string | null
          Последнее_изменение: string | null
          Регион: string | null
          Род: string | null
          Семейство: string | null
          Страна: string | null
          Тэги: string | null
          Широта: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_collection: {
        Args: {
          collect_id?: string
          order?: string
          family?: string
          genus?: string
          kind?: string
          age?: string
          sex?: string
          vauch_inst?: string
          vauch_id?: string
          point?: unknown
          country?: string
          region?: string
          subregion?: string
          geocomment?: string
          date_collect?: string
          comment?: string
          collectors?: string[]
          rna?: boolean
        }
        Returns: undefined
      }
      add_topology: {
        Args: {
          order: string
          family?: string
          genus?: string
          kind?: string
        }
        Returns: string
      }
      collectors_test: {
        Args: {
          collectors: string[]
        }
        Returns: number
      }
      get_age_id: {
        Args: {
          age_name: string
        }
        Returns: number
      }
      get_collector_id: {
        Args: {
          last_name: string
          first_name?: string
          second_name?: string
        }
        Returns: number
      }
      get_country_id: {
        Args: {
          name: string
        }
        Returns: number
      }
      get_family_id: {
        Args: {
          name: string
          order_id: number
        }
        Returns: number
      }
      get_genom_row: {
        Args: {
          collection_id: number
        }
        Returns: {
          row_id: number
          order: Database["public"]["CompositeTypes"]["topology_type"]
          family: Database["public"]["CompositeTypes"]["topology_type"]
          genus: Database["public"]["CompositeTypes"]["topology_type"]
          kind: Database["public"]["CompositeTypes"]["topology_type"]
        }[]
      }
      get_genus_id: {
        Args: {
          name: string
          family_id: number
        }
        Returns: number
      }
      get_id_by_name: {
        Args: {
          table_name: string
          name_: string
        }
        Returns: number
      }
      get_kind_id: {
        Args: {
          name: string
          genus_id: number
        }
        Returns: number
      }
      get_order_id: {
        Args: {
          order_name: string
        }
        Returns: number
      }
      get_region_id: {
        Args: {
          name: string
          country: number
        }
        Returns: number
      }
      get_sex_id: {
        Args: {
          sex_name: string
        }
        Returns: number
      }
      get_subregion_id: {
        Args: {
          name: string
          region_id: number
        }
        Returns: number
      }
      get_user_info: {
        Args: {
          user_id: string
        }
        Returns: {
          first_name: string
          last_name: string
          avatar: string
        }[]
      }
      get_vouch_inst_id: {
        Args: {
          name: string
        }
        Returns: number
      }
      remove_collection_by_id: {
        Args: {
          col_id: number
        }
        Returns: undefined
      }
      test: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      try_cast_double: {
        Args: {
          inp: string
        }
        Returns: number
      }
      update_collection_by_id: {
        Args: {
          col_id: number
          collect_id?: string
          order?: string
          family?: string
          genus?: string
          kind?: string
          age?: string
          sex?: string
          vauch_inst?: string
          vauch_id?: string
          point?: unknown
          country?: string
          region?: string
          subregion?: string
          geocomment?: string
          date_collect?: string
          comment?: string
          collectors?: string[]
          rna?: boolean
        }
        Returns: undefined
      }
      update_collection_taxonomy_by_ids: {
        Args: {
          col_id: number
          order_id?: number
          family_id?: number
          genus_id?: number
          kind_id?: number
        }
        Returns: undefined
      }
      url_decode: {
        Args: {
          data: string
        }
        Returns: string
      }
      url_encode: {
        Args: {
          data: string
        }
        Returns: string
      }
      verify: {
        Args: {
          token: string
          secret: string
          algorithm?: string
        }
        Returns: {
          header: Json
          payload: Json
          valid: boolean
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      collector_type: {
        id: number | null
        last_name: string | null
        first_name: string | null
        second_name: string | null
      }
      tag_type: {
        id: number | null
        name: string | null
        description: string | null
        color: string | null
      }
      topology_type: {
        id: number | null
        name: string | null
      }
      user_type: {
        id: string | null
        first_name: string | null
        last_name: string | null
        avatar: string | null
      }
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          level: number | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          level?: number | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          level?: number | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      prefixes: {
        Row: {
          bucket_id: string
          created_at: string | null
          level: number
          name: string
          updated_at: string | null
        }
        Insert: {
          bucket_id: string
          created_at?: string | null
          level?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          bucket_id?: string
          created_at?: string | null
          level?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prefixes_bucketId_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_prefixes: {
        Args: {
          _bucket_id: string
          _name: string
        }
        Returns: undefined
      }
      can_insert_object: {
        Args: {
          bucketid: string
          name: string
          owner: string
          metadata: Json
        }
        Returns: undefined
      }
      delete_prefix: {
        Args: {
          _bucket_id: string
          _name: string
        }
        Returns: boolean
      }
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: string[]
      }
      get_level: {
        Args: {
          name: string
        }
        Returns: number
      }
      get_prefix: {
        Args: {
          name: string
        }
        Returns: string
      }
      get_prefixes: {
        Args: {
          name: string
        }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
        }
        Returns: {
          key: string
          id: string
          created_at: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          start_after?: string
          next_token?: string
        }
        Returns: {
          name: string
          id: string
          metadata: Json
          updated_at: string
        }[]
      }
      operation: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
      search_legacy_v1: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
      search_v1_optimised: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
      search_v2: {
        Args: {
          prefix: string
          bucket_name: string
          limits?: number
          levels?: number
          start_after?: string
        }
        Returns: {
          key: string
          name: string
          id: string
          updated_at: string
          created_at: string
          metadata: Json
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
    DefaultSchemaTableNameOrOptions extends
            | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
        | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends {
          schema: keyof Database
        }
        ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
            Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
        : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
          Row: infer R
        }
        ? R
        : never
    : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
            DefaultSchema["Views"])
        ? (DefaultSchema["Tables"] &
            DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
              Row: infer R
            }
            ? R
            : never
        : never

export type TablesInsert<
    DefaultSchemaTableNameOrOptions extends
            | keyof DefaultSchema["Tables"]
        | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends {
          schema: keyof Database
        }
        ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
        : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
          Insert: infer I
        }
        ? I
        : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
        ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
              Insert: infer I
            }
            ? I
            : never
        : never

export type TablesUpdate<
    DefaultSchemaTableNameOrOptions extends
            | keyof DefaultSchema["Tables"]
        | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends {
          schema: keyof Database
        }
        ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
        : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
          Update: infer U
        }
        ? U
        : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
        ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
              Update: infer U
            }
            ? U
            : never
        : never

export type Enums<
    DefaultSchemaEnumNameOrOptions extends
            | keyof DefaultSchema["Enums"]
        | { schema: keyof Database },
    EnumName extends DefaultSchemaEnumNameOrOptions extends {
          schema: keyof Database
        }
        ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
        : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
    ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
        ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
        : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
            | keyof DefaultSchema["CompositeTypes"]
        | { schema: keyof Database },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
          schema: keyof Database
        }
        ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
        : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
    ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
        ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
        : never

export const Constants = {
  gis: {
    Enums: {},
  },
  graphql_public: {
    Enums: {},
  },
  pgbouncer: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
  storage: {
    Enums: {},
  },
} as const
