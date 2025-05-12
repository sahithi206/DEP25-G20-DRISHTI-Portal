import React from "react";
import Navbar from "./Navbar";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <section className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-teal-900 border-b-2 border-teal-700 pb-2">
            About Us
          </h2>

          <p className="mt-6 text-gray-800 text-lg leading-relaxed">
            <b>ResearchX</b> - established through an  
            Act of Parliament: <b>ResearchX Act, 2023</b>, to provide high-level strategic directions  
            for research, innovation, and entrepreneurship in the fields of natural sciences,  
            including mathematical sciences, engineering and technology, environmental and  
            earth sciences, health and agriculture, and scientific and technological interfaces  
            of humanities and social sciences.
          </p>

          <p className="mt-4 text-gray-800 text-lg leading-relaxed">
            <b>ResearchX</b> has been established to promote  
            research and development and foster a culture of research and innovation throughout  
            India's Universities, Colleges, Research Institutions, and R&D laboratories. ResearchX acts as an apex body  
            to provide high-level strategic direction of scientific research in the country as per  
            recommendations of the National Education Policy. ResearchX forges collaborations among  
            industry, academia, research institutions, and government departments.
          </p>

          <blockquote className="italic text-teal-800 font-medium mt-6 border-l-4 border-teal-500 pl-4 py-2">
            "ResearchX strategies should align with the goals of Viksit Bharat 2047 and  
            implementation should follow global best practices adopted by research  
            and development agencies across the world" – <b>ResearchX Governing Body</b>
          </blockquote>

          <h3 className="mt-8 text-xl text-teal-900 font-semibold border-b-2 border-teal-700 pb-2">
            ResearchX represents India's pioneering efforts to unleash Indian research  
            and innovation talent to achieve global scientific and technological excellence  
            with the following objectives:
          </h3>

          <ul className="list-decimal list-inside mt-6 text-gray-800 space-y-3 pl-4">
            <li>Preparing the roadmap for short, medium, and long-term research and development.</li>
            <li>Seeding, growing, and facilitating research at academic and research institutions, particularly at universities and colleges where research capacity is at a nascent stage, through programs such as research and development projects, fellowships, academic chairs, and creation of centers of excellence.</li>
            <li>Funding competitive peer-reviewed grant proposals to eligible persons.</li>
            <li>Assisting in setting up research infrastructure and an environment conducive for scientific pursuit, with a specific focus on matters of national priorities, emerging frontiers, and strategic research.</li>
            <li>Increasing India's role and participation in key areas of national and global importance.</li>
            <li>Supporting the translation of research undertaken into capital-intensive technologies.</li>
            <li>Evolving nationally coordinated programs to identify scientific and practical solutions for societal, developmental, financial, and techno-economic challenges.</li>
            <li>Coordinating across the Central Government, State Governments, public authorities, industries, and research institutions to document and analyze the expenditure on scientific research and its outcomes during each financial year, and report the same to the Central Government.</li>
            <li>Evolving participation in international collaborative projects and fostering the exchange of scientific information.</li>
            <li>Encouraging collaboration with scientists from within and outside India, including scientists of Indian origin, to enrich the Indian scientific ecosystem.</li>
            <li>Encouraging Public Sector Enterprises and private sector entities to invest in the activities of the Foundation.</li>
            <li>Undertaking an annual survey of outcomes of scientific research in India, with a view to creating a central repository for the collection, interpretation, and analysis of information and data surrounding such research. The aim of the repository includes providing information for policy formulation and advising the Central Government, State Governments, and the private sector (excluding any strategic areas of research as determined by the Governing Board).</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;