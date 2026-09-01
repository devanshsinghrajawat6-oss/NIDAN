import { NextResponse } from 'next/server';
import { connectDB, Trial } from '@/lib/db';

/**
 * Generate CDISC Define-XML 2.0 metadata document describing
 * the SDTM and ADaM datasets for regulatory submission.
 */
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const trialId = searchParams.get('trialId');

    const trials = await Trial.find(trialId ? { trialId } : {});

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ODM xmlns="http://www.cdisc.org/ns/odm/v1.3"
     xmlns:def="http://www.cdisc.org/ns/def/v2.0"
     FileType="Snapshot"
     FileOID="DEFINE_XML_${trialId || 'ALL'}_${Date.now()}"
     CreationDateTime="${new Date().toISOString()}"
     ODMVersion="1.3.2">
  <Study OID="${trialId || 'AIIA_PORTFOLIO'}">
    <GlobalVariables>
      <StudyName>${trials[0]?.name || 'All India Institute of Ayurveda CTMS Portfolio'}</StudyName>
      <StudyDescription>Standardized CDISC SDTM/ADaM Submissions for Ayurvedic Clinical Trials</StudyDescription>
      <ProtocolName>${trials[0]?.trialId || 'AIIA_PROTOCOLS'}</ProtocolName>
    </GlobalVariables>
    <MetaDataVersion OID="MDV.SDTM.3.3" Name="Study Data Tabulation Model Version 3.3" def:StandardName="SDTM-IG" def:StandardVersion="3.3">
      <def:ItemGroupDef OID="IG.DM" Name="DM" Repeating="No" IsReferenceData="No" Purpose="Tabulation" def:Structure="One record per subject" def:DomainKeys="STUDYID, USUBJID">
        <Description><TranslatedText xml:lang="en">Demographics</TranslatedText></Description>
        <ItemRef ItemOID="IT.STUDYID" Mandatory="Yes" Role="Identifier"/>
        <ItemRef ItemOID="IT.DOMAIN" Mandatory="Yes" Role="Identifier"/>
        <ItemRef ItemOID="IT.USUBJID" Mandatory="Yes" Role="Identifier"/>
        <ItemRef ItemOID="IT.SUBJID" Mandatory="Yes" Role="Topic"/>
        <ItemRef ItemOID="IT.RFSTDTC" Mandatory="Yes" Role="Record Qualifier"/>
        <ItemRef ItemOID="IT.ARM" Mandatory="Yes" Role="Record Qualifier"/>
        <ItemRef ItemOID="IT.SEX" Mandatory="Yes" Role="Record Qualifier"/>
      </def:ItemGroupDef>
      <def:ItemGroupDef OID="IG.AE" Name="AE" Repeating="Yes" IsReferenceData="No" Purpose="Tabulation" def:Structure="One record per adverse event" def:DomainKeys="STUDYID, USUBJID, AESEQ">
        <Description><TranslatedText xml:lang="en">Adverse Events</TranslatedText></Description>
        <ItemRef ItemOID="IT.STUDYID" Mandatory="Yes" Role="Identifier"/>
        <ItemRef ItemOID="IT.DOMAIN" Mandatory="Yes" Role="Identifier"/>
        <ItemRef ItemOID="IT.USUBJID" Mandatory="Yes" Role="Identifier"/>
        <ItemRef ItemOID="IT.AETERM" Mandatory="Yes" Role="Topic"/>
        <ItemRef ItemOID="IT.AEDECOD" Mandatory="No" Role="Synonym Qualifier"/>
        <ItemRef ItemOID="IT.AESEV" Mandatory="Yes" Role="Record Qualifier"/>
        <ItemRef ItemOID="IT.AESER" Mandatory="Yes" Role="Record Qualifier"/>
        <ItemRef ItemOID="IT.AEREL" Mandatory="No" Role="Record Qualifier"/>
      </def:ItemGroupDef>
      <def:ItemGroupDef OID="IG.DS" Name="DS" Repeating="Yes" IsReferenceData="No" Purpose="Tabulation" def:Structure="One record per disposition event" def:DomainKeys="STUDYID, USUBJID, DSSEQ">
        <Description><TranslatedText xml:lang="en">Disposition</TranslatedText></Description>
      </def:ItemGroupDef>
      <def:ItemGroupDef OID="IG.SV" Name="SV" Repeating="Yes" IsReferenceData="No" Purpose="Tabulation" def:Structure="One record per visit per subject" def:DomainKeys="STUDYID, USUBJID, VISITNUM">
        <Description><TranslatedText xml:lang="en">Subject Visits</TranslatedText></Description>
      </def:ItemGroupDef>
    </MetaDataVersion>
  </Study>
</ODM>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Content-Disposition': `attachment; filename="define_xml_${trialId || 'all'}_${Date.now()}.xml"`
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
