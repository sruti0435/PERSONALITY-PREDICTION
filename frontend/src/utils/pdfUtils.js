import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Generates a PDF with the assessment questions and answers
 * @param {Object} assessmentData - The assessment data with questions and answers
 * @param {string} title - The title for the PDF
 * @returns {Object} - Result object with success status and filename
 */
export const generateAssessmentPDF = (assessmentData, title = "Generated Assessment") => {
  try {
    // Initialize PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 128);
    doc.text(title, pageWidth / 2, 20, { align: 'center' });
    
    // Add date
    const currentDate = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${currentDate}`, pageWidth / 2, 30, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text("Assessment Questions", margin, 40);
    
    let questions;
    try {
      // Try to parse if it's a string
      questions = typeof assessmentData === 'string' ? JSON.parse(assessmentData) : assessmentData;
      
      // Ensure it's an array
      if (!Array.isArray(questions)) {
        if (questions.questions && Array.isArray(questions.questions)) {
          questions = questions.questions;
        } else {
          throw new Error("Could not find questions array in assessment data");
        }
      }
    } catch (error) {
      console.error("Error parsing assessment data:", error);
      throw new Error("Failed to generate PDF: Invalid assessment data format");
    }

    // Group questions by type
    const mcqQuestions = questions.filter(q => q.type === "MCQ" || (q.options && q.options.length > 2));
    const shortAnswerQuestions = questions.filter(q => q.type === "SHORT_ANSWER");
    const longAnswerQuestions = questions.filter(q => q.type === "LONG_ANSWER");
    const otherQuestions = questions.filter(q => 
      !mcqQuestions.includes(q) && 
      !shortAnswerQuestions.includes(q) && 
      !longAnswerQuestions.includes(q)
    );

    let yPosition = 50;
    const lineHeight = 10;
    
    // Function to add question section
    const addQuestionSection = (sectionTitle, questionList, startY) => {
      let y = startY;
      
      // Add section title
      doc.setFontSize(14);
      doc.setTextColor(0, 102, 204);
      doc.text(sectionTitle, margin, y);
      y += lineHeight * 1.5;
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      // Add questions
      questionList.forEach((question, index) => {
        // Check if we need to add a new page
        if (y > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          y = margin + 10;
        }
        
        const questionText = question.type === "ASSERTION_REASONING" 
          ? question.question 
          : `${index + 1}. ${question.question}`;
        
        const splitQuestion = doc.splitTextToSize(questionText, pageWidth - (margin * 2));
        doc.text(splitQuestion, margin, y);
        y += lineHeight * splitQuestion.length;
        
        // Add options for MCQ type questions
        if (question.options) {
          y += lineHeight / 2;
          
          question.options.forEach((option, optIndex) => {
            // Check if we need to add a new page
            if (y > doc.internal.pageSize.getHeight() - margin) {
              doc.addPage();
              y = margin + 10;
            }
            
            const optionText = doc.splitTextToSize(
              `${String.fromCharCode(65 + optIndex)}. ${option}`, 
              pageWidth - (margin * 2) - 10
            );
            doc.text(optionText, margin + 10, y);
            y += lineHeight * optionText.length;
          });
        }
        
        y += lineHeight;
      });
      
      return y;
    };
    
    // Add MCQ questions
    if (mcqQuestions.length > 0) {
      yPosition = addQuestionSection("Multiple Choice Questions", mcqQuestions, yPosition);
      yPosition += lineHeight;
    }
    
    // Add Short Answer questions
    if (shortAnswerQuestions.length > 0) {
      yPosition = addQuestionSection("Short Answer Questions", shortAnswerQuestions, yPosition);
      yPosition += lineHeight;
    }
    
    // Add Long Answer questions
    if (longAnswerQuestions.length > 0) {
      yPosition = addQuestionSection("Long Answer Questions", longAnswerQuestions, yPosition);
      yPosition += lineHeight;
    }
    
    // Add other questions if any
    if (otherQuestions.length > 0) {
      yPosition = addQuestionSection("Other Questions", otherQuestions, yPosition);
      yPosition += lineHeight;
    }
console.log("yPosition:", yPosition);    
    // Add Answer Key section
    doc.addPage();
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 128);
    doc.text("Answer Key", pageWidth / 2, 20, { align: 'center' });
    
    const columns = ['#', 'Type', 'Correct Answer', 'Explanation', 'Reference'];
    
    // Format the data for the answer key table
    const data = questions.map((question, index) => [
      index + 1,
      question.type || 'General',
      question.correctAnswer || 'N/A',
      question.explanation || 'N/A',
      question.reference || 'N/A'
    ]);
    
    doc.autoTable({
      startY: 30,
      head: [columns],
      body: data,
      headStyles: { fillColor: [0, 102, 204] },
      styles: { overflow: 'linebreak' },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 20 },
        2: { cellWidth: 50 },
        3: { cellWidth: 60 },
        4: { cellWidth: 40 }
      }
    });
    
    // Save the PDF
    const fileName = `${title.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
    
    return {
      success: true,
      fileName: fileName,
      totalPages: doc.internal.getNumberOfPages(),
      questionCount: questions.length,
    };
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
};
